package com.adaptiq.adaptiq_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserResponse {
    private String id;   // UUID serialised as String for JSON consistency
    private String email;
    private String name;
}
