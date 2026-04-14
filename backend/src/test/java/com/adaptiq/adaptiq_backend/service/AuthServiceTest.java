package com.adaptiq.adaptiq_backend.service;

import com.adaptiq.adaptiq_backend.dto.request.LoginRequest;
import com.adaptiq.adaptiq_backend.dto.request.RegisterRequest;
import com.adaptiq.adaptiq_backend.dto.response.AuthResponse;
import com.adaptiq.adaptiq_backend.exception.BadRequestException;
import com.adaptiq.adaptiq_backend.model.User;
import com.adaptiq.adaptiq_backend.repository.UserRepository;
import com.adaptiq.adaptiq_backend.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @InjectMocks AuthService authService;

    @Test
    void register_success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");
        req.setName("Test User");

        User savedUser = new User();
        savedUser.setId(UUID.randomUUID());
        savedUser.setEmail(req.getEmail());
        savedUser.setPassword("hashed");
        savedUser.setName(req.getName());

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(req.getPassword())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtil.generateToken(req.getEmail())).thenReturn("mock.jwt.token");

        AuthResponse response = authService.register(req);

        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getName()).isEqualTo("Test User");
    }

    @Test
    void register_duplicateEmail_throwsBadRequest() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existing@example.com");
        req.setPassword("password123");
        req.setName("Test");

        when(userRepository.existsByEmail(req.getEmail())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void login_success() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("password123");

        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(req.getEmail());
        user.setPassword("hashed");
        user.setName("Test User");

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(req.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(req.getEmail())).thenReturn("mock.jwt.token");

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("mock.jwt.token");
    }

    @Test
    void login_wrongPassword_throwsBadRequest() {
        LoginRequest req = new LoginRequest();
        req.setEmail("test@example.com");
        req.setPassword("wrongpassword");

        User user = new User();
        user.setEmail(req.getEmail());
        user.setPassword("hashed");

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(req.getPassword(), user.getPassword())).thenReturn(false);

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid email or password");
    }

    @Test
    void login_emailNotFound_throwsBadRequest() {
        LoginRequest req = new LoginRequest();
        req.setEmail("nobody@example.com");
        req.setPassword("password");

        when(userRepository.findByEmail(req.getEmail())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Invalid email or password");
    }
}
