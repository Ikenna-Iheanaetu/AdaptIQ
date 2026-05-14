package com.adaptiq.adaptiq_backend.repository;

import com.adaptiq.adaptiq_backend.model.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, UUID> {
    List<QuizQuestion> findByAttemptIdOrderByOrderIndexAsc(UUID attemptId);

    @Query("SELECT COUNT(q) FROM QuizQuestion q WHERE q.attemptId = :attemptId AND q.isCorrect = true")
    long countCorrectByAttemptId(@Param("attemptId") UUID attemptId);

    @Query("SELECT COUNT(q) FROM QuizQuestion q WHERE q.attemptId = :attemptId")
    long countByAttemptId(@Param("attemptId") UUID attemptId);
}
