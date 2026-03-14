package com.luxe.ecommerce.service;

import com.luxe.ecommerce.model.Product;
import com.luxe.ecommerce.model.SellerProfile;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class AiVerificationService {

    public ReviewResult reviewSellerProfile(SellerProfile profile) {
        List<String> issues = new ArrayList<>();
        int score = 100;

        if (isBlank(profile.getBusinessName()) || profile.getBusinessName().trim().length() < 3) {
            issues.add("Business name is too short or missing.");
            score -= 30;
        }
        if (isBlank(profile.getDescription()) || profile.getDescription().trim().length() < 40) {
            issues.add("Business description is too brief to verify the seller properly.");
            score -= 20;
        }
        if (isBlank(profile.getAddress())) {
            issues.add("Business address is missing.");
            score -= 15;
        }
        if (isBlank(profile.getTaxId())) {
            issues.add("Tax or registration ID is missing.");
            score -= 15;
        }
        if (isBlank(profile.getDocumentUrl())) {
            issues.add("Verification document link is missing.");
            score -= 25;
        }
        if (!isBlank(profile.getWebsite()) && !profile.getWebsite().startsWith("http")) {
            issues.add("Website should start with http:// or https://.");
            score -= 10;
        }
        if (containsSuspiciousLanguage(profile.getBusinessName(), profile.getDescription())) {
            issues.add("Profile contains suspicious placeholder or misleading text.");
            score -= 35;
        }

        return finalizeResult(score, issues, "seller profile");
    }

    public ReviewResult reviewProduct(Product product) {
        List<String> issues = new ArrayList<>();
        int score = 100;

        if (isBlank(product.getName()) || product.getName().trim().length() < 4) {
            issues.add("Product name is too short.");
            score -= 25;
        }
        if (isBlank(product.getDescription()) || product.getDescription().trim().length() < 30) {
            issues.add("Product description needs more detail.");
            score -= 20;
        }
        if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            issues.add("Price must be greater than zero.");
            score -= 40;
        }
        if (product.getStock() == null || product.getStock() < 0) {
            issues.add("Stock value is invalid.");
            score -= 25;
        }
        if (isBlank(product.getCategory())) {
            issues.add("Category is missing.");
            score -= 10;
        }
        if (isBlank(product.getBrand())) {
            issues.add("Brand is missing.");
            score -= 10;
        }
        if (isBlank(product.getMainImageUrl())) {
            issues.add("Primary product image is missing.");
            score -= 20;
        }
        if (containsSuspiciousLanguage(product.getName(), product.getDescription(), product.getBrand())) {
            issues.add("Product text contains terms often associated with counterfeit or placeholder listings.");
            score -= 40;
        }

        return finalizeResult(score, issues, "product listing");
    }

    private ReviewResult finalizeResult(int score, List<String> issues, String subject) {
        int boundedScore = Math.max(0, Math.min(100, score));
        String recommendation;

        if (boundedScore >= 80 && issues.isEmpty()) {
            recommendation = "APPROVE";
        } else if (boundedScore >= 55) {
            recommendation = "MANUAL_REVIEW";
        } else {
            recommendation = "REJECT";
        }

        String summary = issues.isEmpty()
                ? "AI review found no major issues in this " + subject + "."
                : "AI review flagged " + issues.size() + " issue(s) in this " + subject + ".";

        return new ReviewResult(boundedScore, summary, issues, recommendation);
    }

    private boolean containsSuspiciousLanguage(String... values) {
        for (String value : values) {
            if (isBlank(value)) {
                continue;
            }

            String normalized = value.toLowerCase(Locale.ROOT);
            if (normalized.contains("fake")
                    || normalized.contains("replica")
                    || normalized.contains("copy")
                    || normalized.contains("dummy")
                    || normalized.contains("test product")) {
                return true;
            }
        }
        return false;
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    public record ReviewResult(int score, String summary, List<String> issues, String recommendation) {
    }
}
