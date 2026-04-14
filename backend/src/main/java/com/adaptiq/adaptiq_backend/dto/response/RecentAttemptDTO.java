package com.adaptiq.adaptiq_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class RecentAttemptDTO {
    private UUID attemptId;
    private int score;
    private int totalQuestions;
    private LocalDateTime completedAt;
}
