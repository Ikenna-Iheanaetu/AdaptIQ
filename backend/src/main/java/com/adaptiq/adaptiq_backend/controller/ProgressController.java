package com.adaptiq.adaptiq_backend.controller;

import com.adaptiq.adaptiq_backend.dto.response.DashboardResponse;
import com.adaptiq.adaptiq_backend.dto.response.HistoryAttemptDTO;
import com.adaptiq.adaptiq_backend.dto.response.TopicProgressItem;
import com.adaptiq.adaptiq_backend.service.ProgressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardResponse> getDashboard(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(progressService.getDashboard(auth));
    }

    @GetMapping("/history")
    public ResponseEntity<List<HistoryAttemptDTO>> getHistory(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(progressService.getHistory(auth));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicProgressItem>> getTopicProgress(
            @RequestHeader("Authorization") String auth) {
        return ResponseEntity.ok(progressService.getTopicProgress(auth));
    }
}
