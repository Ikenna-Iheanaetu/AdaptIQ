package com.adaptiq.adaptiq_backend.service;

import com.adaptiq.adaptiq_backend.model.enums.DifficultyLevel;
import com.adaptiq.adaptiq_backend.model.enums.QuestionType;
import tools.jackson.databind.json.JsonMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIQuestionService {

    @Value("${openai.api.key}")
    private String openAiKey;

    @Value("${openai.model:gpt-4o}")
    private String model;

    @Value("${openai.max-tokens:600}")
    private int maxTokens;

    private final RestTemplate restTemplate = new RestTemplate();

    private final JsonMapper jsonMapper;

    public GeneratedQuestion generateQuestion(
            String topicName,
            DifficultyLevel difficulty,
            QuestionType questionType,
            List<String> previousQuestions) {

        String difficultyDesc = switch (difficulty) {
            case BEGINNER     -> "basic syntax, definitions, and fundamental concepts";
            case INTERMEDIATE -> "applied concepts, reading short code snippets";
            case ADVANCED     -> "debugging, optimisation, and multi-concept reasoning";
        };

        String typeDesc = switch (questionType) {
            case MCQ        -> "multiple choice with exactly 4 options";
            case TRUE_FALSE -> "true or false with exactly 2 options: True, False";
            case FILL_BLANK -> "fill in the blank — the question contains ___ and the answer is a single word or short phrase";
        };

        String avoidSection = previousQuestions.isEmpty() ? "" :
            "\n\nDo NOT repeat or closely resemble:\n- " + String.join("\n- ", previousQuestions);

        String prompt = String.format("""
            You are a coding quiz generator for AdaptIQ.
            Generate a %s question about %s.
            Difficulty: %s (%s). Question type: %s.
            %s

            Respond ONLY with valid JSON, no markdown:
            {
              "questionText": "...",
              "options": ["...", "...", "...", "..."],
              "correctAnswer": "...",
              "explanation": "..."
            }
            Rules:
            - options: exactly 4 items for MCQ, exactly 2 for TRUE_FALSE, empty [] for FILL_BLANK
            - correctAnswer must match one of the options (for MCQ/TRUE_FALSE) or be the expected phrase (FILL_BLANK)
            - explanation: 1-2 sentences
            """,
            questionType.name().toLowerCase().replace("_", " "),
            topicName, difficulty.name(), difficultyDesc, typeDesc, avoidSection
        );

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(openAiKey);

            Map<String, Object> body = Map.of(
                "model", model,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", maxTokens,
                "temperature", 0.7
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(
                "https://api.openai.com/v1/chat/completions", request, Map.class);

            @SuppressWarnings("unchecked")
            String content = (String) ((Map<String, Object>) ((Map<String, Object>)
                ((List<?>) response.getBody().get("choices")).get(0))
                .get("message")).get("content");

            return jsonMapper.readValue(content.trim(), GeneratedQuestion.class);

        } catch (Exception e) {
            log.error("OpenAI question generation failed for topic '{}': {}", topicName, e.getMessage());
            return fallback(topicName, questionType);
        }
    }

    private GeneratedQuestion fallback(String topicName, QuestionType questionType) {
        return new GeneratedQuestion(
            "What is a fundamental concept in " + topicName + "?",
            List.of("Variables", "Loops", "Functions", "Classes"),
            "Functions",
            "Functions are reusable blocks of code — a core concept in all programming."
        );
    }

    public record GeneratedQuestion(
        String questionText,
        List<String> options,
        String correctAnswer,
        String explanation
    ) {}
}
