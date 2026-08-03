package com.smartjewel.service;

import com.smartjewel.domain.model.User;
import com.smartjewel.domain.model.UserRole;
import com.smartjewel.dto.AuthResponse;
import com.smartjewel.dto.LoginRequest;
import com.smartjewel.dto.RegisterRequest;
import com.smartjewel.dto.UserResponse;
import com.smartjewel.repository.UserRepository;
import com.smartjewel.security.TokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenService tokenService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("E-mail já cadastrado");
        }

        User user = User.builder()
                .nome(request.getNome())
                .email(request.getEmail())
                .senha(passwordEncoder.encode(request.getSenha()))
                .role(request.getRole() != null ? request.getRole() : UserRole.USER)
                .build();

        User savedUser = userRepository.save(user);
        String token = tokenService.generateToken(savedUser);

        return AuthResponse.builder()
                .token(token)
                .id(savedUser.getId())
                .nome(savedUser.getNome())
                .email(savedUser.getEmail())
                .role(savedUser.getRole())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getSenha())
        );

        User user = (User) authentication.getPrincipal();
        String token = tokenService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .nome(user.getNome())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .nome(user.getNome())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .createdBy(user.getCreatedBy())
                .lastModifiedBy(user.getLastModifiedBy())
                .build();
    }
}
