package com.adaptiq.adaptiq_backend.repository;

import com.adaptiq.adaptiq_backend.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findTop5ByTopicIdAndUserIdOrderByCompletedAtDesc(UUID topicId, UUID userId);
}
