package com.adaptiq.adaptiq_backend.dto.response;

public record DiagnosticCompleteResponse(
    int overallScore,
    int correctAnswers,
    int totalQuestions
) {}
