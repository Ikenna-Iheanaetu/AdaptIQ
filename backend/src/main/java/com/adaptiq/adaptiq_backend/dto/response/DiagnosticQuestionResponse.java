package com.adaptiq.adaptiq_backend.dto.response;

import java.util.List;
import java.util.UUID;

public record DiagnosticQuestionResponse(
    UUID questionId,
    UUID attemptId,
    int position,
    int total,
    String questionText,
    String questionType,
    List<String> options
) {}
