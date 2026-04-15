package com.adaptiq.adaptiq_backend.controller;

import com.adaptiq.adaptiq_backend.dto.request.LoginRequest;
import com.adaptiq.adaptiq_backend.dto.request.RegisterRequest;
import com.adaptiq.adaptiq_backend.dto.response.AuthResponse;
import com.adaptiq.adaptiq_backend.service.AuthService;
import tools.jackson.databind.json.JsonMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.security.autoconfigure.web.servlet.SecurityFilterAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
    value = AuthController.class,
    excludeAutoConfiguration = {SecurityAutoConfiguration.class, SecurityFilterAutoConfiguration.class}
)
class AuthControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired JsonMapper jsonMapper;
    @MockitoBean AuthService authService;

    @Test
    void login_validRequest_returns200WithToken() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");

        when(authService.login(any())).thenReturn(
                new AuthResponse("jwt.token.here", "uuid-123", "test@example.com", "Test User"));

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("jwt.token.here"))
                .andExpect(jsonPath("$.email").value("test@example.com"));
    }

    @Test
    void login_invalidEmail_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"not-an-email\",\"password\":\"pass\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void register_validRequest_returns201() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("new@example.com");
        req.setPassword("password123");
        req.setName("New User");

        when(authService.register(any())).thenReturn(
                new AuthResponse("jwt.token.here", "uuid-456", "new@example.com", "New User"));

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    void register_shortPassword_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"a@b.com\",\"password\":\"short\",\"name\":\"A\"}"))
                .andExpect(status().isBadRequest());
    }
}
