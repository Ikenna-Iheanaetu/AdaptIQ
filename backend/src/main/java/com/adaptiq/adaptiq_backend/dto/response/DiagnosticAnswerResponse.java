package com.adaptiq.adaptiq_backend.dto.response;

public record DiagnosticAnswerResponse(
    boolean isCorrect,
    String correctAnswer,
    String explanation,
    int currentPosition,
    int total,
    boolean isLastQuestion,
    DiagnosticQuestionResponse nextQuestion
) {}
