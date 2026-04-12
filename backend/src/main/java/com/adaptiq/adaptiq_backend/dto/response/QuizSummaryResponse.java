package com.adaptiq.adaptiq_backend.dto.response;

import lombok.Data;

@Data
public class QuizSummaryResponse {
    private int totalQuestions;
    private int correctAnswers;
    private int score;
}
