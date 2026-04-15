package com.adaptiq.adaptiq_backend.repository;

import com.adaptiq.adaptiq_backend.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {
    List<QuizQuestion> findByAttemptIdOrderByOrderIndexAsc(UUID attemptId);
}
