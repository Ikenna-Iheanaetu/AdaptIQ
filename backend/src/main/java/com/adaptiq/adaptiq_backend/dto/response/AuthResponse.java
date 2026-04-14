package com.adaptiq.adaptiq_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String id;
    private String email;
    private String name;
}
