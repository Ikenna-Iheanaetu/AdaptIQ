package com.adaptiq.adaptiq_backend.controller;

import com.adaptiq.adaptiq_backend.dto.response.TopicDetailResponse;
import com.adaptiq.adaptiq_backend.dto.response.TopicResponse;
import com.adaptiq.adaptiq_backend.exception.ResourceNotFoundException;
import com.adaptiq.adaptiq_backend.repository.UserRepository;
import com.adaptiq.adaptiq_backend.service.TopicService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/topics")
@RequiredArgsConstructor
public class TopicController {

    private final TopicService topicService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TopicResponse>> listTopics() {
        return ResponseEntity.ok(topicService.listTopics());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TopicDetailResponse> getTopicDetail(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails userDetails) {
        var user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(topicService.getTopicDetail(id, user.getId()));
    }
}
