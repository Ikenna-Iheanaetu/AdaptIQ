package com.adaptiq.adaptiq_backend.repository;

import com.adaptiq.adaptiq_backend.model.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, UUID> {
}
