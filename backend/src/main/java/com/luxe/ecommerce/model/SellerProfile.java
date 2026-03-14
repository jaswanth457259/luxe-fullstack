package com.luxe.ecommerce.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "seller_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SellerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false)
    private String businessName = "";

    private String businessType;
    private String taxId;
    private String website;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String address;

    private String documentUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SellerApprovalStatus status = SellerApprovalStatus.DRAFT;

    private Integer aiReviewScore;

    @Column(columnDefinition = "TEXT")
    private String aiReviewSummary;

    @Column(columnDefinition = "TEXT")
    private String aiReviewIssues;

    private String aiRecommendation;

    @Column(columnDefinition = "TEXT")
    private String adminNotes;

    private LocalDateTime submittedAt;
    private LocalDateTime reviewedAt;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
