package com.adaptiq.adaptiq_backend.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class DashboardResponse {
    private int totalAttempts;
    private int averageScore;
    private int streakDays;
    private String strongestTopicName;
    private String weakestTopicName;
    private List<TopicProgressItem> topicProgress;
    private List<TopicResponse> recommendations;
    private List<RecentAttemptDTO> recentScores;
}
