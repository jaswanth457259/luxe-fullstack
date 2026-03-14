package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.AuthDto;
import com.luxe.ecommerce.model.Role;
import com.luxe.ecommerce.model.SellerApprovalStatus;
import com.luxe.ecommerce.model.SellerProfile;
import com.luxe.ecommerce.model.User;
import com.luxe.ecommerce.repository.SellerProfileRepository;
import com.luxe.ecommerce.repository.UserRepository;
import com.luxe.ecommerce.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final GoogleTokenVerifierService googleTokenVerifierService;
    private final JdbcTemplate jdbcTemplate;

    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        String normalizedFullName = request.getFullName() == null ? "" : request.getFullName().trim();

        if (normalizedEmail.isBlank() || normalizedFullName.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Full name and email are required");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
        }

        Role role = resolveRequestedRole(request.getAccountType());
        User user = User.builder()
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(normalizedFullName)
                .phone(request.getPhone() == null ? "" : request.getPhone().trim())
                .address("")
                .role(role)
                .enabled(true)
                .build();

        try {
            userRepository.save(user);
        } catch (Exception ex) {
            if (role == Role.SELLER && tryMigrateRoleColumnAndRetry(user, ex)) {
                log.info("Retried seller registration successfully after users.role schema migration for {}",
                        user.getEmail());
            } else if (ex instanceof DataIntegrityViolationException) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Account already exists or profile data is invalid", ex);
            } else {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "Registration failed due to database schema mismatch", ex);
            }
        }

        if (role == Role.SELLER) {
            try {
                createSellerProfile(user);
            } catch (Exception ex) {
                // Keep account creation successful even if legacy seller profile schema
                // differs.
                log.warn("Seller profile creation failed for user {}: {}", user.getEmail(), ex.getMessage());
            }
        }

        return buildAuthResponse(user);
    }

    private boolean tryMigrateRoleColumnAndRetry(User user, Exception rootException) {
        try {
            log.warn("Seller insert failed for {}. Attempting users.role schema migration. Root cause: {}",
                    user.getEmail(), rootException.getMessage());
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(20) NOT NULL");
            userRepository.save(user);
            return true;
        } catch (Exception migrationException) {
            log.error("users.role schema migration failed", migrationException);
            return false;
        }
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthDto.AuthResponse googleAuth(AuthDto.GoogleAuthRequest request) {
        GoogleTokenVerifierService.GoogleUserProfile googleProfile = googleTokenVerifierService
                .verify(request.getCredential());

        User user = userRepository.findByGoogleId(googleProfile.getGoogleId())
                .orElseGet(() -> resolveGoogleUser(googleProfile));

        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is disabled");
        }

        return buildAuthResponse(user);
    }

    private User resolveGoogleUser(GoogleTokenVerifierService.GoogleUserProfile googleProfile) {
        return userRepository.findByEmail(googleProfile.getEmail())
                .map(existingUser -> linkExistingUser(existingUser, googleProfile))
                .orElseGet(() -> createGoogleUser(googleProfile));
    }

    private User linkExistingUser(User existingUser, GoogleTokenVerifierService.GoogleUserProfile googleProfile) {
        if (existingUser.getGoogleId() != null && !existingUser.getGoogleId().equals(googleProfile.getGoogleId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "That email is already linked to another Google account");
        }

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
                .phone("")
                .address("")
                .googleId(googleProfile.getGoogleId())
                .role(Role.USER)
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

    private Role resolveRequestedRole(String accountType) {
        return "SELLER".equalsIgnoreCase(accountType) ? Role.SELLER : Role.USER;
    }

    private SellerProfile createSellerProfile(User user) {
        return sellerProfileRepository.save(SellerProfile.builder()
                .user(user)
                .businessName(user.getFullName() == null ? "" : user.getFullName().trim())
                .businessType("")
                .taxId("")
                .website("")
                .description("")
                .address("")
                .documentUrl("")
                .status(SellerApprovalStatus.DRAFT)
                .aiReviewScore(0)
                .aiReviewSummary("")
                .aiReviewIssues("")
                .aiRecommendation("")
                .adminNotes("")
                .build());
    }

    private AuthDto.AuthResponse buildAuthResponse(User user) {
        String token;
        try {
            token = jwtUtil.generateToken(user.getEmail());
        } catch (Exception ex) {
            log.error("JWT generation failed for user {}", user.getEmail(), ex);
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Authentication service is misconfigured (JWT secret).",
                    ex);
        }

        String sellerApprovalStatus = null;
        try {
            sellerApprovalStatus = sellerProfileRepository.findByUser(user)
                    .map(profile -> profile.getStatus() == null ? null : profile.getStatus().name())
                    .orElse(user.getRole() == Role.SELLER ? SellerApprovalStatus.DRAFT.name() : null);
        } catch (Exception ex) {
            log.warn("Seller profile status lookup failed for user {}: {}", user.getEmail(), ex.getMessage());
            if (user.getRole() == Role.SELLER) {
                sellerApprovalStatus = SellerApprovalStatus.DRAFT.name();
            }
        }

        return new AuthDto.AuthResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole().name(),
                sellerApprovalStatus);
    }
}
