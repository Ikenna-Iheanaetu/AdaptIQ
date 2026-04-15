package com.adaptiq.adaptiq_backend.repository;

import com.adaptiq.adaptiq_backend.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
    List<QuizAttempt> findTop5ByTopicIdAndUserIdOrderByCompletedAtDesc(UUID topicId, UUID userId);

    @Modifying
    @Query("DELETE FROM QuizAttempt a WHERE a.user.id = :userId AND a.isDiagnostic = true AND a.completedAt IS NULL")
    void deleteIncompleteDiagnosticAttempts(@Param("userId") UUID userId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM QuizAttempt a WHERE a.user.id = :userId AND a.isDiagnostic = true AND a.completedAt IS NOT NULL")
    boolean hasDiagnosticCompleted(@Param("userId") UUID userId);
}
