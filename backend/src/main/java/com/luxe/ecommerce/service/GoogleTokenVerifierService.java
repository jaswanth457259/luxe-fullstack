package com.luxe.ecommerce.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.List;

@Service
public class GoogleTokenVerifierService {

    private final GoogleIdTokenVerifier verifier;

    public GoogleTokenVerifierService(@Value("${app.google.client-id:}") String clientId) {
        String normalizedClientId = clientId == null ? "" : clientId.trim();

        this.verifier = normalizedClientId.isBlank()
                ? null
                : new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                .setAudience(List.of(normalizedClientId))
                .build();
    }

    public GoogleUserProfile verify(String credential) {
        if (verifier == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Google sign-in is not configured");
        }

        try {
            GoogleIdToken idToken = verifier.verify(credential);

            if (idToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google credential");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());
            String fullName = payload.get("name") instanceof String ? (String) payload.get("name") : null;
            String hostedDomain = payload.get("hd") instanceof String ? (String) payload.get("hd") : null;

            if (googleId == null || googleId.isBlank() || email == null || email.isBlank()) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google account details are incomplete");
            }

            if (!emailVerified) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
            }

            return new GoogleUserProfile(googleId, email.trim().toLowerCase(), fullName, hostedDomain);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (GeneralSecurityException | IOException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Google credential verification failed", ex);
        }
    }

    @Getter
    public static class GoogleUserProfile {
        private final String googleId;
        private final String email;
        private final String fullName;
        private final String hostedDomain;

        public GoogleUserProfile(String googleId, String email, String fullName, String hostedDomain) {
            this.googleId = googleId;
            this.email = email;
            this.fullName = fullName;
            this.hostedDomain = hostedDomain;
        }

        public boolean hasAuthoritativeGoogleEmail() {
            return email.endsWith("@gmail.com")
                    || (hostedDomain != null && !hostedDomain.isBlank());
        }
    }
}
