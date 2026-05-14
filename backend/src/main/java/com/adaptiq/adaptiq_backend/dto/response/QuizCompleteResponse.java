package com.adaptiq.adaptiq_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class QuizCompleteResponse {
    private UUID attemptId;
    private int score;
    private int correctAnswers;
    private int totalQuestions;
}
