package com.adaptiq.adaptiq_backend.controller;

import com.adaptiq.adaptiq_backend.dto.request.DiagnosticAnswerRequest;
import com.adaptiq.adaptiq_backend.dto.response.*;
import com.adaptiq.adaptiq_backend.model.User;
import com.adaptiq.adaptiq_backend.repository.UserRepository;
import com.adaptiq.adaptiq_backend.security.JwtUtil;
import com.adaptiq.adaptiq_backend.service.DiagnosticService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/diagnostic")
@RequiredArgsConstructor
public class DiagnosticController {

    private final DiagnosticService diagnosticService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @GetMapping("/status")
    public ResponseEntity<?> getStatus(@RequestHeader("Authorization") String authHeader) {
        UUID userId = extractUserId(authHeader);
        return ResponseEntity.ok(Map.of("completed", diagnosticService.hasCompletedDiagnostic(userId)));
    }

    @PostMapping("/start")
    public ResponseEntity<DiagnosticQuestionResponse> start(
            @RequestHeader("Authorization") String authHeader) {
        UUID userId = extractUserId(authHeader);
        return ResponseEntity.ok(diagnosticService.startDiagnostic(userId));
    }

    @PostMapping("/{attemptId}/answer")
    public ResponseEntity<DiagnosticAnswerResponse> answer(
            @PathVariable UUID attemptId,
            @RequestBody @Valid DiagnosticAnswerRequest req) {
        return ResponseEntity.ok(
            diagnosticService.submitAnswer(attemptId, req.questionId(), req.answer()));
    }

    @PostMapping("/{attemptId}/complete")
    public ResponseEntity<DiagnosticCompleteResponse> complete(
            @PathVariable UUID attemptId,
            @RequestHeader("Authorization") String authHeader) {
        UUID userId = extractUserId(authHeader);
        return ResponseEntity.ok(diagnosticService.completeDiagnostic(userId, attemptId));
    }

    @PostMapping("/skip")
    public ResponseEntity<?> skip(@RequestHeader("Authorization") String authHeader) {
        UUID userId = extractUserId(authHeader);
        diagnosticService.skipDiagnostic(userId);
        return ResponseEntity.ok(Map.of("message", "Diagnostic skipped."));
    }

    private UUID extractUserId(String authHeader) {
        String token = authHeader.replace("Bearer ", "");
        String email = jwtUtil.extractEmail(token);
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
