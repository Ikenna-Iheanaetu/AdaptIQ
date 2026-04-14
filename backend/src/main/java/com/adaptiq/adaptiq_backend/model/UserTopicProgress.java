package com.adaptiq.adaptiq_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

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
}
