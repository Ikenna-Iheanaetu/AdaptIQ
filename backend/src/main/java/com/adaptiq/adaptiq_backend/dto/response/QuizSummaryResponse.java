package com.adaptiq.adaptiq_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class QuizSummaryResponse {
    private int score;
    private int correctAnswers;
    private int totalQuestions;
    private long durationSeconds;
    private List<QuizSummaryQuestion> questions;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class QuizSummaryQuestion {
        private String questionText;
        private String questionType;
        private List<String> options;
        private String learnerAnswer;
        private String correctAnswer;
        private Boolean isCorrect;
        private String explanation;
    }
}
