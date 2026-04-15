package com.adaptiq.adaptiq_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;

@Data
@Entity
@Table(name = "user_topic_progress")
public class UserTopicProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Topic topic;

    private int score;
    private int attempts;
    private int bestScore;
    private LocalDate lastQuizDate;
    @Enumerated(EnumType.STRING)
    private com.adaptiq.adaptiq_backend.model.enums.ProficiencyLevel proficiencyLevel;
}
