package com.adaptiq.adaptiq_backend.dto.response;

import lombok.Data;
import java.util.List;

@Data
public class DashboardResponse {
    private int totalAttempts;
    private int averageScore;
    private int streakDays;
    private List<TopicResponse> recommendations;
}
