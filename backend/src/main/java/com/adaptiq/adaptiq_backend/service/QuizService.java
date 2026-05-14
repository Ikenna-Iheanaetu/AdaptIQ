package com.adaptiq.adaptiq_backend.service;

import com.adaptiq.adaptiq_backend.dto.request.DiagnosticAnswerRequest;
import com.adaptiq.adaptiq_backend.dto.response.DiagnosticAnswerResponse;
import com.adaptiq.adaptiq_backend.dto.response.DiagnosticQuestionResponse;
import com.adaptiq.adaptiq_backend.dto.response.QuizCompleteResponse;
import com.adaptiq.adaptiq_backend.dto.response.QuizSummaryResponse;
import com.adaptiq.adaptiq_backend.exception.BadRequestException;
import com.adaptiq.adaptiq_backend.exception.ResourceNotFoundException;
import com.adaptiq.adaptiq_backend.model.QuizAttempt;
import com.adaptiq.adaptiq_backend.model.QuizQuestion;
import com.adaptiq.adaptiq_backend.model.Topic;
import com.adaptiq.adaptiq_backend.model.User;
import com.adaptiq.adaptiq_backend.model.UserTopicProgress;
import com.adaptiq.adaptiq_backend.model.enums.DifficultyLevel;
import com.adaptiq.adaptiq_backend.model.enums.ProficiencyLevel;
import com.adaptiq.adaptiq_backend.model.enums.QuestionType;
import com.adaptiq.adaptiq_backend.repository.QuizAttemptRepository;
import com.adaptiq.adaptiq_backend.repository.QuizQuestionRepository;
import com.adaptiq.adaptiq_backend.repository.TopicRepository;
import com.adaptiq.adaptiq_backend.repository.UserRepository;
import com.adaptiq.adaptiq_backend.repository.UserTopicProgressRepository;
import com.adaptiq.adaptiq_backend.security.JwtUtil;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final AIQuestionService aiQuestionService;
    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizQuestionRepository quizQuestionRepository;
    private final UserTopicProgressRepository userTopicProgressRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final JsonMapper objectMapper;

    @Transactional
    public DiagnosticQuestionResponse startAttempt(String authHeader, UUID topicId, int questionCount) {
        User user = extractUser(authHeader);

        Topic topic = topicRepository.findById(topicId)
            .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + topicId));

        QuizAttempt attempt = new QuizAttempt();
        attempt.setUser(user);
        attempt.setTopicId(topicId);
        attempt.setTotalQuestions(questionCount);
        attempt.setDiagnostic(false);
        attempt.setStartedAt(LocalDateTime.now());
        quizAttemptRepository.save(attempt);

        List<QuizQuestion> questions = generateQuestions(attempt.getId(), topic, questionCount);
        for (int i = 0; i < questions.size(); i++) {
            questions.get(i).setOrderIndex(i);
        }
        quizQuestionRepository.saveAll(questions);

        return toQuestionResponse(questions.get(0), 1, questionCount, attempt.getId());
    }

    @Transactional
    public DiagnosticAnswerResponse submitAnswer(UUID attemptId, String authHeader, DiagnosticAnswerRequest req) {
        // Verify attempt exists
        quizAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

        QuizQuestion question = quizQuestionRepository.findById(req.questionId())
            .orElseThrow(() -> new ResourceNotFoundException("Question not found: " + req.questionId()));

        if (!question.getAttemptId().equals(attemptId)) {
            throw new BadRequestException("Question does not belong to this attempt.");
        }

        List<QuizQuestion> all = quizQuestionRepository.findByAttemptIdOrderByOrderIndexAsc(attemptId);

        int position = -1;
        for (int i = 0; i < all.size(); i++) {
            if (all.get(i).getId().equals(req.questionId())) {
                position = i + 1;
                break;
            }
        }
        if (position == -1) {
            throw new BadRequestException("Question does not belong to this attempt.");
        }

        boolean isCorrect = question.getCorrectAnswer().trim().equalsIgnoreCase(req.answer().trim());
        question.setLearnerAnswer(req.answer());
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
    public QuizCompleteResponse completeAttempt(UUID attemptId, String authHeader) {
        User user = extractUser(authHeader);

        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

        attempt.setCompletedAt(LocalDateTime.now());

        long correct = quizQuestionRepository.countCorrectByAttemptId(attemptId);
        int total = attempt.getTotalQuestions();
        int score = total == 0 ? 0 : (int) Math.round((double) correct / total * 100);

        attempt.setCorrectAnswers((int) correct);
        attempt.setScore(score);
        quizAttemptRepository.save(attempt);

        // Upsert UserTopicProgress
        UUID topicId = attempt.getTopicId();
        if (topicId != null) {
            Topic topic = topicRepository.findById(topicId).orElse(null);
            if (topic != null) {
                Optional<UserTopicProgress> existing =
                    userTopicProgressRepository.findByUserIdAndTopicId(user.getId(), topicId);

                if (existing.isPresent()) {
                    UserTopicProgress progress = existing.get();
                    int oldAttempts = progress.getAttempts();
                    int oldScore = progress.getScore();
                    // Running average
                    int newScore = (int) Math.round(((double) oldScore * oldAttempts + score) / (oldAttempts + 1));
                    progress.setAttempts(oldAttempts + 1);
                    progress.setScore(newScore);
                    if (score > progress.getBestScore()) {
                        progress.setBestScore(score);
                    }
                    progress.setLastQuizDate(LocalDate.now());
                    if (progress.getBestScore() >= 70) {
                        progress.setProficiencyLevel(ProficiencyLevel.INTERMEDIATE);
                    }
                    userTopicProgressRepository.save(progress);
                } else {
                    UserTopicProgress progress = new UserTopicProgress();
                    progress.setUser(user);
                    progress.setTopic(topic);
                    progress.setAttempts(1);
                    progress.setScore(score);
                    progress.setBestScore(score);
                    progress.setLastQuizDate(LocalDate.now());
                    progress.setProficiencyLevel(score >= 70 ? ProficiencyLevel.INTERMEDIATE : ProficiencyLevel.BEGINNER);
                    userTopicProgressRepository.save(progress);
                }
            }
        }

        return new QuizCompleteResponse(attemptId, score, (int) correct, total);
    }

    public QuizSummaryResponse getSummary(UUID attemptId, String authHeader) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Attempt not found: " + attemptId));

        LocalDateTime end = attempt.getCompletedAt() != null ? attempt.getCompletedAt() : LocalDateTime.now();
        long durationSeconds = attempt.getStartedAt() != null
            ? ChronoUnit.SECONDS.between(attempt.getStartedAt(), end)
            : 0L;

        List<QuizQuestion> questions =
            quizQuestionRepository.findByAttemptIdOrderByOrderIndexAsc(attemptId);

        List<QuizSummaryResponse.QuizSummaryQuestion> summaryQuestions = questions.stream()
            .map(q -> {
                List<String> options = parseOptions(q.getOptionsJson());
                return new QuizSummaryResponse.QuizSummaryQuestion(
                    q.getQuestionText(),
                    q.getQuestionType(),
                    options,
                    q.getLearnerAnswer(),
                    q.getCorrectAnswer(),
                    Boolean.TRUE.equals(q.getIsCorrect()),
                    q.getExplanation()
                );
            })
            .collect(Collectors.toList());

        return new QuizSummaryResponse(
            attempt.getScore(),
            attempt.getCorrectAnswers() != null ? attempt.getCorrectAnswers() : 0,
            attempt.getTotalQuestions(),
            durationSeconds,
            summaryQuestions
        );
    }

    // ── helpers ─────────────────────────────────────────────────────────────

    private User extractUser(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private List<String> parseOptions(String optionsJson) {
        try {
            return objectMapper.readValue(optionsJson, new TypeReference<List<String>>() {});
        } catch (Exception ignored) {
            return new ArrayList<>();
        }
    }

    private DiagnosticQuestionResponse toQuestionResponse(
            QuizQuestion q, int position, int total, UUID attemptId) {
        List<String> options = parseOptions(q.getOptionsJson());
        return new DiagnosticQuestionResponse(
            q.getId(), attemptId, position, total,
            q.getQuestionText(), q.getQuestionType(), options
        );
    }

    private List<QuizQuestion> generateQuestions(UUID attemptId, Topic topic, int questionCount) {
        QuestionType[] typeRotation = {
            QuestionType.MCQ, QuestionType.TRUE_FALSE, QuestionType.MCQ, QuestionType.MCQ,
            QuestionType.TRUE_FALSE, QuestionType.MCQ, QuestionType.MCQ, QuestionType.TRUE_FALSE,
            QuestionType.MCQ, QuestionType.MCQ
        };

        record QuestionTask(int orderIndex, QuestionType qType, List<String> previousQuestions) {}

        List<QuestionTask> tasks = new ArrayList<>();
        for (int i = 0; i < questionCount; i++) {
            QuestionType qType = typeRotation[i % typeRotation.length];
            tasks.add(new QuestionTask(i, qType, new ArrayList<>()));
        }

        List<CompletableFuture<QuizQuestion>> futures = tasks.stream()
            .map(task -> CompletableFuture.supplyAsync(() -> {
                AIQuestionService.GeneratedQuestion gq = aiQuestionService.generateQuestion(
                    topic.getName(), DifficultyLevel.BEGINNER, task.qType(), task.previousQuestions());

                QuizQuestion qq = new QuizQuestion();
                qq.setAttemptId(attemptId);
                qq.setTopicId(topic.getId());
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
            }, Executors.newVirtualThreadPerTaskExecutor()))
            .collect(Collectors.toList());

        return futures.stream()
            .map(CompletableFuture::join)
            .collect(Collectors.toList());
    }
}
