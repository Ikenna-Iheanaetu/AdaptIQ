package com.adaptiq.adaptiq_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Data
@Entity
@Table(name = "quiz_questions")
public class QuizQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private UUID topicId;

    @Column(columnDefinition = "TEXT")
    private String questionText;

    @Column(columnDefinition = "TEXT")
    private String optionsJson;

    private String correctAnswer;
    private String difficulty;

    private UUID attemptId;
    private Integer orderIndex;
    private String questionType;
    private String learnerAnswer;
    private Boolean isCorrect;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
