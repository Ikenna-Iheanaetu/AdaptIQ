package com.adaptiq.adaptiq_backend.service;

import com.adaptiq.adaptiq_backend.dto.response.RecentAttemptDTO;
import com.adaptiq.adaptiq_backend.dto.response.TopicDetailResponse;
import com.adaptiq.adaptiq_backend.dto.response.TopicResponse;
import com.adaptiq.adaptiq_backend.exception.ResourceNotFoundException;
import com.adaptiq.adaptiq_backend.model.QuizAttempt;
import com.adaptiq.adaptiq_backend.model.UserTopicProgress;
import com.adaptiq.adaptiq_backend.repository.QuizAttemptRepository;
import com.adaptiq.adaptiq_backend.repository.TopicRepository;
import com.adaptiq.adaptiq_backend.repository.UserTopicProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;
    private final UserTopicProgressRepository userTopicProgressRepository;
    private final QuizAttemptRepository quizAttemptRepository;

    public List<TopicResponse> listTopics() {
        return topicRepository.findAll().stream()
                .map(t -> {
                    TopicResponse r = new TopicResponse();
                    r.setId(t.getId());
                    r.setName(t.getName());
                    r.setDescription(t.getDescription());
                    return r;
                })
                .collect(Collectors.toList());
    }

    public TopicDetailResponse getTopicDetail(UUID topicId, UUID userId) {
        var topic = topicRepository.findById(topicId)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found"));

        Optional<UserTopicProgress> progressOpt =
                userTopicProgressRepository.findByUserIdAndTopicId(userId, topicId);

        int averageScore = progressOpt.map(UserTopicProgress::getScore).orElse(0);
        int bestScore    = progressOpt.map(UserTopicProgress::getBestScore).orElse(0);
        int quizzesTaken = progressOpt.map(UserTopicProgress::getAttempts).orElse(0);
        var lastQuizDate = progressOpt.map(UserTopicProgress::getLastQuizDate).orElse(null);

        List<QuizAttempt> attempts =
                quizAttemptRepository.findTop5ByTopicIdAndUserIdOrderByCompletedAtDesc(topicId, userId);

        List<RecentAttemptDTO> recentAttempts = attempts.stream()
                .map(a -> new RecentAttemptDTO(a.getId(), a.getScore(), a.getTotalQuestions(), a.getCompletedAt()))
                .collect(Collectors.toList());

        return new TopicDetailResponse(
                topic.getId(),
                topic.getName(),
                topic.getDescription(),
                averageScore,
                bestScore,
                quizzesTaken,
                lastQuizDate,
                recentAttempts
        );
    }
}
