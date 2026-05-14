package com.adaptiq.adaptiq_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TopicProgressItem {
    private UUID topicId;
    private String topicName;
    private String topicDescription;
    private String proficiencyLevel;  // null if no progress yet
    private int averageScore;
    private int attempts;
    private LocalDate lastQuizDate;   // null if never
}
