package com.adaptiq.adaptiq_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "quiz_attempts")
public class QuizAttempt {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private User user;

    private UUID topicId;

    private int score;
    private int totalQuestions;
    private LocalDateTime completedAt;

    @Column(nullable = false)
    private boolean isDiagnostic = false;

    private Integer correctAnswers;
    private LocalDateTime startedAt;
    private String difficultyStart;
    private String difficultyEnd;
}
