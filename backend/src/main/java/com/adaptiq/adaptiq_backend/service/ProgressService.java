package com.adaptiq.adaptiq_backend.service;

import com.adaptiq.adaptiq_backend.dto.response.DashboardResponse;
import com.adaptiq.adaptiq_backend.dto.response.HistoryAttemptDTO;
import com.adaptiq.adaptiq_backend.dto.response.RecentAttemptDTO;
import com.adaptiq.adaptiq_backend.dto.response.TopicProgressItem;
import com.adaptiq.adaptiq_backend.dto.response.TopicResponse;
import com.adaptiq.adaptiq_backend.model.QuizAttempt;
import com.adaptiq.adaptiq_backend.model.Topic;
import com.adaptiq.adaptiq_backend.model.User;
import com.adaptiq.adaptiq_backend.model.UserTopicProgress;
import com.adaptiq.adaptiq_backend.repository.QuizAttemptRepository;
import com.adaptiq.adaptiq_backend.repository.TopicRepository;
import com.adaptiq.adaptiq_backend.repository.UserRepository;
import com.adaptiq.adaptiq_backend.repository.UserTopicProgressRepository;
import com.adaptiq.adaptiq_backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {

    private final UserTopicProgressRepository userTopicProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final TopicRepository topicRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public DashboardResponse getDashboard(String authHeader) {
        UUID userId = resolveUserId(authHeader);

        List<UserTopicProgress> progressList = userTopicProgressRepository.findByUserId(userId);
        List<Topic> allTopics = topicRepository.findAll();

        // Build per-topic progress map for quick lookup
        Map<UUID, UserTopicProgress> progressByTopicId = progressList.stream()
                .collect(Collectors.toMap(p -> p.getTopic().getId(), p -> p));

        // Build topicProgress list
        List<TopicProgressItem> topicProgress = buildTopicProgressList(allTopics, progressByTopicId);

        // Total completed non-diagnostic attempts
        List<QuizAttempt> allCompleted = quizAttemptRepository.findAllCompletedNonDiagnosticByUserId(userId);
        int totalAttempts = allCompleted.size();

        // Average score across all UserTopicProgress entries
        int averageScore = progressList.isEmpty() ? 0 :
                (int) Math.round(progressList.stream()
                        .mapToInt(UserTopicProgress::getScore)
                        .average()
                        .orElse(0));

        // Streak calculation
        int streakDays = calculateStreak(allCompleted);

        // Strongest / weakest topic names (only topics with attempts > 0)
        List<TopicProgressItem> attempted = topicProgress.stream()
                .filter(t -> t.getAttempts() > 0)
                .collect(Collectors.toList());

        String strongestTopicName = attempted.stream()
                .max(Comparator.comparingInt(TopicProgressItem::getAverageScore))
                .map(TopicProgressItem::getTopicName)
                .orElse(null);

        String weakestTopicName = attempted.stream()
                .filter(t -> !t.getTopicName().equals(strongestTopicName))
                .min(Comparator.comparingInt(TopicProgressItem::getAverageScore))
                .map(TopicProgressItem::getTopicName)
                .orElse(null);

        // Recommendations: topics with 0 attempts first; fallback to lowest score; up to 3
        List<TopicResponse> recommendations = buildRecommendations(topicProgress);

        // Recent scores: last 8 completed non-diagnostic attempts
        List<RecentAttemptDTO> recentScores = quizAttemptRepository
                .findRecentCompletedByUserId(userId, PageRequest.of(0, 8))
                .stream()
                .map(a -> new RecentAttemptDTO(a.getId(), a.getScore(), a.getTotalQuestions(), a.getCompletedAt()))
                .collect(Collectors.toList());

        DashboardResponse response = new DashboardResponse();
        response.setTotalAttempts(totalAttempts);
        response.setAverageScore(averageScore);
        response.setStreakDays(streakDays);
        response.setStrongestTopicName(strongestTopicName);
        response.setWeakestTopicName(weakestTopicName);
        response.setTopicProgress(topicProgress);
        response.setRecommendations(recommendations);
        response.setRecentScores(recentScores);
        return response;
    }

    public List<HistoryAttemptDTO> getHistory(String authHeader) {
        UUID userId = resolveUserId(authHeader);

        List<QuizAttempt> attempts = quizAttemptRepository.findAllCompletedNonDiagnosticByUserId(userId);

        return attempts.stream()
                .map(a -> {
                    String topicName = "Unknown";
                    if (a.getTopicId() != null) {
                        topicName = topicRepository.findById(a.getTopicId())
                                .map(Topic::getName)
                                .orElse("Unknown");
                    }
                    return new HistoryAttemptDTO(
                            a.getId(),
                            a.getTopicId(),
                            topicName,
                            a.getScore(),
                            a.getTotalQuestions(),
                            a.getCompletedAt(),
                            a.getDifficultyStart(),
                            a.getDifficultyEnd()
                    );
                })
                .collect(Collectors.toList());
    }

    public List<TopicProgressItem> getTopicProgress(String authHeader) {
        UUID userId = resolveUserId(authHeader);

        List<UserTopicProgress> progressList = userTopicProgressRepository.findByUserId(userId);
        List<Topic> allTopics = topicRepository.findAll();

        Map<UUID, UserTopicProgress> progressByTopicId = progressList.stream()
                .collect(Collectors.toMap(p -> p.getTopic().getId(), p -> p));

        return buildTopicProgressList(allTopics, progressByTopicId);
    }

    // --- Helpers ---

    private UUID resolveUserId(String authHeader) {
        String token = authHeader.startsWith("Bearer ") ? authHeader.substring(7) : authHeader;
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }

    private List<TopicProgressItem> buildTopicProgressList(
            List<Topic> allTopics,
            Map<UUID, UserTopicProgress> progressByTopicId) {

        return allTopics.stream()
                .map(topic -> {
                    UserTopicProgress p = progressByTopicId.get(topic.getId());
                    if (p == null) {
                        return new TopicProgressItem(
                                topic.getId(),
                                topic.getName(),
                                topic.getDescription(),
                                null,
                                0,
                                0,
                                null
                        );
                    }
                    return new TopicProgressItem(
                            topic.getId(),
                            topic.getName(),
                            topic.getDescription(),
                            p.getProficiencyLevel() != null ? p.getProficiencyLevel().name() : null,
                            p.getScore(),
                            p.getAttempts(),
                            p.getLastQuizDate()
                    );
                })
                .collect(Collectors.toList());
    }

    private List<TopicResponse> buildRecommendations(List<TopicProgressItem> topicProgress) {
        // Topics with 0 attempts first
        List<TopicProgressItem> unattempted = topicProgress.stream()
                .filter(t -> t.getAttempts() == 0)
                .collect(Collectors.toList());

        if (!unattempted.isEmpty()) {
            return unattempted.stream()
                    .limit(3)
                    .map(t -> {
                        TopicResponse r = new TopicResponse();
                        r.setId(t.getTopicId());
                        r.setName(t.getTopicName());
                        r.setDescription(t.getTopicDescription());
                        return r;
                    })
                    .collect(Collectors.toList());
        }

        // All attempted — return lowest scoring topics
        return topicProgress.stream()
                .sorted(Comparator.comparingInt(TopicProgressItem::getAverageScore))
                .limit(3)
                .map(t -> {
                    TopicResponse r = new TopicResponse();
                    r.setId(t.getTopicId());
                    r.setName(t.getTopicName());
                    r.setDescription(t.getTopicDescription());
                    return r;
                })
                .collect(Collectors.toList());
    }

    private int calculateStreak(List<QuizAttempt> attempts) {
        List<LocalDate> distinctDates = attempts.stream()
                .map(a -> a.getCompletedAt().toLocalDate())
                .distinct()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        int streak = 0;
        LocalDate expected = LocalDate.now();
        for (LocalDate date : distinctDates) {
            if (date.equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else if (date.isBefore(expected)) {
                break;
            }
        }
        return streak;
    }
}
