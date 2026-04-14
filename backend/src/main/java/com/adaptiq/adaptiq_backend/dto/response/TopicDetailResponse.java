package com.adaptiq.adaptiq_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class TopicDetailResponse {
    private UUID id;
    private String name;
    private String description;
    private int averageScore;
    private int bestScore;
    private int quizzesTaken;
    private LocalDate lastQuizDate;
    private List<RecentAttemptDTO> recentAttempts;
}
