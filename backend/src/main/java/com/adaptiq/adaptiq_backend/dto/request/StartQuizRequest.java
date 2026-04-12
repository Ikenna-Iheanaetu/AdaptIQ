package com.adaptiq.adaptiq_backend.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class StartQuizRequest {
    private UUID topicId;
}
