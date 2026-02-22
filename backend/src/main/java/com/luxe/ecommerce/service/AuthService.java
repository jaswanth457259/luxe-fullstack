package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.AuthDto;
import com.luxe.ecommerce.model.User;
import com.luxe.ecommerce.repository.UserRepository;
import com.luxe.ecommerce.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .role(User.Role.USER)
                .build();
        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthDto.AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthDto.AuthResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole().name());
    }
}
