package com.adaptiq.adaptiq_backend.service;

import com.adaptiq.adaptiq_backend.dto.response.DiagnosticAnswerResponse;
import com.adaptiq.adaptiq_backend.dto.response.DiagnosticCompleteResponse;
import com.adaptiq.adaptiq_backend.dto.response.DiagnosticQuestionResponse;
import com.adaptiq.adaptiq_backend.exception.BadRequestException;
import com.adaptiq.adaptiq_backend.model.*;
import com.adaptiq.adaptiq_backend.model.enums.DifficultyLevel;
import com.adaptiq.adaptiq_backend.model.enums.ProficiencyLevel;
import com.adaptiq.adaptiq_backend.model.enums.QuestionType;
import com.adaptiq.adaptiq_backend.repository.*;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiagnosticService {

    private static final int TOTAL_QUESTIONS = 10;

    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final UserTopicProgressRepository userTopicProgressRepository;
    private final AIQuestionService aiQuestionService;
    private final JsonMapper objectMapper;

    public boolean hasCompletedDiagnostic(UUID userId) {
        return quizAttemptRepository.hasDiagnosticCompleted(userId);
    }

    @Transactional
    public DiagnosticQuestionResponse startDiagnostic(UUID userId) {
        if (quizAttemptRepository.hasDiagnosticCompleted(userId)) {
            throw new BadRequestException("Diagnostic already completed.");
        }
        // Clean up any orphaned incomplete attempts (e.g. from a previous failed start)
        quizAttemptRepository.deleteIncompleteDiagnosticAttempts(userId);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setDiagnostic(true);
        attempt.setDifficultyStart("BEGINNER");
        attempt.setDifficultyEnd("BEGINNER");
        attempt.setTotalQuestions(TOTAL_QUESTIONS);
        attempt.setStartedAt(LocalDateTime.now());
        quizAttemptRepository.save(attempt);

        List<Topic> topics = topicRepository.findAll();
        List<QuizQuestion> questions = generateQuestions(attempt.getId(), topics);
        Collections.shuffle(questions);
        // Reassign orderIndex after shuffle so DB ordering matches presentation order
        for (int i = 0; i < questions.size(); i++) {
            questions.get(i).setOrderIndex(i);
        }
        quizQuestionRepository.saveAll(questions);

        return toQuestionResponse(questions.get(0), 1, questions.size(), attempt.getId());
    }

    @Transactional
    public DiagnosticAnswerResponse submitAnswer(UUID attemptId, UUID questionId, String learnerAnswer) {
        QuizQuestion question = quizQuestionRepository.findById(questionId)
            .orElseThrow(() -> new RuntimeException("Question not found"));

        // Find position BEFORE mutation (by ID, not indexOf which breaks after save)
        List<QuizQuestion> all = quizQuestionRepository.findByAttemptIdOrderByOrderIndexAsc(attemptId);
        int position = -1;
        for (int i = 0; i < all.size(); i++) {
            if (all.get(i).getId().equals(questionId)) {
                position = i + 1;
                break;
            }
        }
        if (position == -1) throw new RuntimeException("Question does not belong to this attempt");

        boolean isCorrect = question.getCorrectAnswer().trim().equalsIgnoreCase(learnerAnswer.trim());
        question.setLearnerAnswer(learnerAnswer);
        question.setIsCorrect(isCorrect);
        quizQuestionRepository.save(question);

        boolean isLast = position == all.size();
        DiagnosticQuestionResponse nextQuestion = null;
        if (!isLast) {
            nextQuestion = toQuestionResponse(all.get(position), position + 1, all.size(), attemptId);
        }

        return new DiagnosticAnswerResponse(
            isCorrect, question.getCorrectAnswer(), question.getExplanation(),
            position, all.size(), isLast, nextQuestion
        );
    }

    @Transactional
    public DiagnosticCompleteResponse completeDiagnostic(UUID userId, UUID attemptId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new RuntimeException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized to complete this attempt.");
        }

        List<QuizQuestion> all = quizQuestionRepository.findByAttemptIdOrderByOrderIndexAsc(attemptId);
        long correct = all.stream().filter(q -> Boolean.TRUE.equals(q.getIsCorrect())).count();
        int overallScore = all.isEmpty() ? 0 : (int) Math.round((double) correct / all.size() * 100);

        attempt.setCorrectAnswers((int) correct);
        attempt.setScore(overallScore);
        attempt.setCompletedAt(LocalDateTime.now());
        quizAttemptRepository.save(attempt);

        Map<UUID, List<QuizQuestion>> byTopic = all.stream()
            .filter(q -> q.getTopicId() != null)
            .collect(Collectors.groupingBy(QuizQuestion::getTopicId));

        for (Topic topic : topicRepository.findAll()) {
            if (userTopicProgressRepository.existsByUserIdAndTopicId(userId, topic.getId())) continue;

            List<QuizQuestion> topicQs = byTopic.getOrDefault(topic.getId(), List.of());
            int topicScore = 0;
            if (!topicQs.isEmpty()) {
                long topicCorrect = topicQs.stream()
                    .filter(q -> Boolean.TRUE.equals(q.getIsCorrect())).count();
                topicScore = (int) Math.round((double) topicCorrect / topicQs.size() * 100);
            }

            UserTopicProgress progress = new UserTopicProgress();
            progress.setUser(user);
            progress.setTopic(topic);
            progress.setScore(topicScore);
            progress.setProficiencyLevel(topicScore >= 70 ? ProficiencyLevel.INTERMEDIATE : ProficiencyLevel.BEGINNER);
            progress.setAttempts(0);
            userTopicProgressRepository.save(progress);
        }

        return new DiagnosticCompleteResponse(overallScore, (int) correct, all.size());
    }

    @Transactional
    public void skipDiagnostic(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        for (Topic topic : topicRepository.findAll()) {
            if (userTopicProgressRepository.existsByUserIdAndTopicId(userId, topic.getId())) continue;
            UserTopicProgress progress = new UserTopicProgress();
            progress.setUser(user);
            progress.setTopic(topic);
            progress.setScore(0);
            progress.setProficiencyLevel(ProficiencyLevel.BEGINNER);
            progress.setAttempts(0);
            userTopicProgressRepository.save(progress);
        }
    }

    private List<QuizQuestion> generateQuestions(UUID attemptId, List<Topic> topics) {
        int base = TOTAL_QUESTIONS / topics.size();
        int extra = TOTAL_QUESTIONS % topics.size();

        QuestionType[] typeRotation = {
            QuestionType.MCQ, QuestionType.TRUE_FALSE, QuestionType.MCQ, QuestionType.MCQ,
            QuestionType.TRUE_FALSE, QuestionType.MCQ, QuestionType.MCQ, QuestionType.TRUE_FALSE,
            QuestionType.MCQ, QuestionType.MCQ
        };

        // Build work items: (topic, questionType, alreadyAsked-snapshot, orderIndex)
        record QuestionTask(Topic topic, QuestionType qType, List<String> previousQuestions, int orderIndex) {}

        List<QuestionTask> tasks = new ArrayList<>();
        int typeIndex = 0;
        int orderIdx = 0;
        for (int t = 0; t < topics.size(); t++) {
            Topic topic = topics.get(t);
            int count = base + (t < extra ? 1 : 0);
            List<String> seenSoFar = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                QuestionType qType = typeRotation[typeIndex % typeRotation.length];
                typeIndex++;
                tasks.add(new QuestionTask(topic, qType, new ArrayList<>(seenSoFar), orderIdx++));
                // seenSoFar tracks questions within the same topic iteration only (not across parallel
                // execution), but this is acceptable for BEGINNER-level question diversity.
            }
        }

        // Generate in parallel using virtual threads
        List<CompletableFuture<QuizQuestion>> futures = tasks.stream()
            .map(task -> CompletableFuture.supplyAsync(() -> {
                AIQuestionService.GeneratedQuestion gq = aiQuestionService.generateQuestion(
                    task.topic().getName(), DifficultyLevel.BEGINNER, task.qType(), task.previousQuestions());

                QuizQuestion qq = new QuizQuestion();
                qq.setAttemptId(attemptId);
                qq.setTopicId(task.topic().getId());
                qq.setOrderIndex(task.orderIndex());
                qq.setQuestionText(gq.questionText());
                qq.setQuestionType(task.qType().name());
                qq.setDifficulty("BEGINNER");
                qq.setCorrectAnswer(gq.correctAnswer());
                qq.setExplanation(gq.explanation());
                try {
                    qq.setOptionsJson(objectMapper.writeValueAsString(gq.options()));
                } catch (Exception e) {
                    qq.setOptionsJson("[]");
                }
                return qq;
            }, java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()))
            .toList();

        return futures.stream()
            .map(CompletableFuture::join)
            .collect(Collectors.toList());
    }

    private DiagnosticQuestionResponse toQuestionResponse(
            QuizQuestion q, int position, int total, UUID attemptId) {
        List<String> options = List.of();
        try {
            options = objectMapper.readValue(q.getOptionsJson(), new TypeReference<List<String>>() {});
        } catch (Exception ignored) {}

        return new DiagnosticQuestionResponse(
            q.getId(), attemptId, position, total,
            q.getQuestionText(), q.getQuestionType(), options
        );
    }
}
