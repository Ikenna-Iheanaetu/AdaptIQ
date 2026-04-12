package com.adaptiq.adaptiq_backend.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class TopicResponse {
    private UUID id;
    private String name;
    private String description;
}
