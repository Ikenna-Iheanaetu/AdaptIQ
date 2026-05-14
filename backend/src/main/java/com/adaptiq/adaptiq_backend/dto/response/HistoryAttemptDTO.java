package com.adaptiq.adaptiq_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class HistoryAttemptDTO {
    private UUID attemptId;
    private UUID topicId;
    private String topicName;
    private int score;
    private int totalQuestions;
    private LocalDateTime completedAt;
    private String difficultyStart;
    private String difficultyEnd;
}
