package com.adaptiq.adaptiq_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record DiagnosticAnswerRequest(
    @NotNull UUID questionId,
    @NotBlank String answer
) {}
