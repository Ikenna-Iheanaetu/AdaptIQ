package com.adaptiq.adaptiq_backend.controller;

import com.adaptiq.adaptiq_backend.dto.response.UserResponse;
import com.adaptiq.adaptiq_backend.exception.ResourceNotFoundException;
import com.adaptiq.adaptiq_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(@AuthenticationPrincipal UserDetails userDetails) {
        com.adaptiq.adaptiq_backend.model.User user =
                userRepository.findByEmail(userDetails.getUsername())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(
                new UserResponse(user.getId().toString(), user.getEmail(), user.getName()));
    }
}
