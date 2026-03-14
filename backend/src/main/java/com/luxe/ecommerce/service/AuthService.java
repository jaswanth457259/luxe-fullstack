package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.AuthDto;
import com.luxe.ecommerce.model.User;
import com.luxe.ecommerce.repository.UserRepository;
import com.luxe.ecommerce.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final GoogleTokenVerifierService googleTokenVerifierService;

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
                .enabled(true)
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

    @Transactional
    public AuthDto.AuthResponse googleAuth(AuthDto.GoogleAuthRequest request) {
        GoogleTokenVerifierService.GoogleUserProfile googleProfile =
                googleTokenVerifierService.verify(request.getCredential());

        User user = userRepository.findByGoogleId(googleProfile.getGoogleId())
                .orElseGet(() -> resolveGoogleUser(googleProfile));

        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is disabled");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthDto.AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    private User resolveGoogleUser(GoogleTokenVerifierService.GoogleUserProfile googleProfile) {
        return userRepository.findByEmail(googleProfile.getEmail())
                .map(existingUser -> linkExistingUser(existingUser, googleProfile))
                .orElseGet(() -> createGoogleUser(googleProfile));
    }

    private User linkExistingUser(User existingUser, GoogleTokenVerifierService.GoogleUserProfile googleProfile) {
        if (existingUser.getGoogleId() != null && !existingUser.getGoogleId().equals(googleProfile.getGoogleId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That email is already linked to another Google account");
        }

        // Only auto-link existing password accounts when Google is authoritative for the email.
        if ((existingUser.getGoogleId() == null || existingUser.getGoogleId().isBlank())
                && !googleProfile.hasAuthoritativeGoogleEmail()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account with this email already exists. Sign in with password first to keep the account secure.");
        }

        existingUser.setGoogleId(googleProfile.getGoogleId());

        if (googleProfile.getFullName() != null && !googleProfile.getFullName().isBlank()) {
            existingUser.setFullName(googleProfile.getFullName().trim());
        }

        return userRepository.save(existingUser);
    }

    private User createGoogleUser(GoogleTokenVerifierService.GoogleUserProfile googleProfile) {
        User user = User.builder()
                .email(googleProfile.getEmail())
                .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                .fullName(resolveFullName(googleProfile))
                .googleId(googleProfile.getGoogleId())
                .role(User.Role.USER)
                .enabled(true)
                .build();

        return userRepository.save(user);
    }

    private String resolveFullName(GoogleTokenVerifierService.GoogleUserProfile googleProfile) {
        if (googleProfile.getFullName() != null && !googleProfile.getFullName().isBlank()) {
            return googleProfile.getFullName().trim();
        }

        int atIndex = googleProfile.getEmail().indexOf('@');
        return atIndex > 0 ? googleProfile.getEmail().substring(0, atIndex) : googleProfile.getEmail();
    }
}
