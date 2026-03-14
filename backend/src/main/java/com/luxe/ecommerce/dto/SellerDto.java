package com.luxe.ecommerce.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class SellerDto {

    @Data
    public static class SellerProfileRequest {
        private String businessName;
        private String businessType;
        private String taxId;
        private String website;
        private String description;
        private String address;
        private String documentUrl;
        private boolean submitForReview;
    }

    @Data
    public static class ReviewDecisionRequest {
        private boolean approved;
        private String adminNotes;
    }

    @Data
    public static class SellerProfileResponse {
        private Long id;
        private Long userId;
        private String email;
        private String fullName;
        private String businessName;
        private String businessType;
        private String taxId;
        private String website;
        private String description;
        private String address;
        private String documentUrl;
        private String status;
        private Integer aiReviewScore;
        private String aiReviewSummary;
        private List<String> aiReviewIssues;
        private String aiRecommendation;
        private String adminNotes;
        private LocalDateTime submittedAt;
        private LocalDateTime reviewedAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class SellerProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private Integer stock;
        private String category;
        private String brand;
        private String sku;
        private String mainImageUrl;
        private List<String> images;
        private boolean active;
        private String approvalStatus;
        private Integer aiReviewScore;
        private String aiReviewSummary;
        private List<String> aiReviewIssues;
        private String aiRecommendation;
        private String adminNotes;
        private LocalDateTime submittedAt;
        private LocalDateTime reviewedAt;
        private LocalDateTime updatedAt;
        private Long sellerId;
        private String sellerName;
        private String sellerEmail;
    }
}
