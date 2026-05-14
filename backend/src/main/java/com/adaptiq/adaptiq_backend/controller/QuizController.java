package com.adaptiq.adaptiq_backend.controller;

import com.adaptiq.adaptiq_backend.dto.request.DiagnosticAnswerRequest;
import com.adaptiq.adaptiq_backend.dto.request.StartQuizRequest;
import com.adaptiq.adaptiq_backend.dto.response.DiagnosticAnswerResponse;
import com.adaptiq.adaptiq_backend.dto.response.DiagnosticQuestionResponse;
import com.adaptiq.adaptiq_backend.dto.response.QuizCompleteResponse;
import com.adaptiq.adaptiq_backend.dto.response.QuizSummaryResponse;
import com.adaptiq.adaptiq_backend.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/quiz")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @PostMapping("/start")
    public ResponseEntity<DiagnosticQuestionResponse> start(
            @RequestHeader("Authorization") String auth,
            @RequestBody @Valid StartQuizRequest req) {
        return ResponseEntity.ok(
            quizService.startAttempt(auth, req.getTopicId(), req.getQuestionCount()));
    }

    @PostMapping("/{attemptId}/answer")
    public ResponseEntity<DiagnosticAnswerResponse> answer(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID attemptId,
            @RequestBody @Valid DiagnosticAnswerRequest req) {
        return ResponseEntity.ok(quizService.submitAnswer(attemptId, auth, req));
    }

    @PostMapping("/{attemptId}/complete")
    public ResponseEntity<QuizCompleteResponse> complete(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID attemptId) {
        return ResponseEntity.ok(quizService.completeAttempt(attemptId, auth));
    }

    @GetMapping("/{attemptId}/summary")
    public ResponseEntity<QuizSummaryResponse> summary(
            @RequestHeader("Authorization") String auth,
            @PathVariable UUID attemptId) {
        return ResponseEntity.ok(quizService.getSummary(attemptId, auth));
    }
}
