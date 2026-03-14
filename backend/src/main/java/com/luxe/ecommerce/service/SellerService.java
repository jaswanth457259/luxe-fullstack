package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.ProductDto;
import com.luxe.ecommerce.dto.SellerDto;
import com.luxe.ecommerce.model.Product;
import com.luxe.ecommerce.model.ProductApprovalStatus;
import com.luxe.ecommerce.model.Role;
import com.luxe.ecommerce.model.SellerApprovalStatus;
import com.luxe.ecommerce.model.SellerProfile;
import com.luxe.ecommerce.model.User;
import com.luxe.ecommerce.repository.ProductRepository;
import com.luxe.ecommerce.repository.SellerProfileRepository;
import com.luxe.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final UserRepository userRepository;
    private final SellerProfileRepository sellerProfileRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final AiVerificationService aiVerificationService;

    @Transactional(readOnly = true)
    public SellerDto.SellerProfileResponse getMyProfile(String email) {
        User seller = getSeller(email);
        return mapProfile(getOrCreateProfile(seller));
    }

    @Transactional
    public SellerDto.SellerProfileResponse upsertProfile(String email, SellerDto.SellerProfileRequest request) {
        User seller = getSeller(email);
        SellerProfile profile = getOrCreateProfile(seller);

        profile.setBusinessName(trimToEmpty(request.getBusinessName(), seller.getFullName()));
        profile.setBusinessType(trimToNull(request.getBusinessType()));
        profile.setTaxId(trimToNull(request.getTaxId()));
        profile.setWebsite(trimToNull(request.getWebsite()));
        profile.setDescription(trimToNull(request.getDescription()));
        profile.setAddress(trimToNull(request.getAddress()));
        profile.setDocumentUrl(trimToNull(request.getDocumentUrl()));

        AiVerificationService.ReviewResult review = aiVerificationService.reviewSellerProfile(profile);
        applyReview(profile, review);

        if (request.isSubmitForReview()) {
            profile.setStatus(SellerApprovalStatus.PENDING_REVIEW);
            profile.setSubmittedAt(LocalDateTime.now());
        } else if (profile.getStatus() != SellerApprovalStatus.APPROVED) {
            profile.setStatus(SellerApprovalStatus.DRAFT);
        }

        return mapProfile(sellerProfileRepository.save(profile));
    }

    @Transactional(readOnly = true)
    public Page<SellerDto.SellerProductResponse> getMyProducts(String email, Pageable pageable) {
        User seller = getSeller(email);
        return productRepository.findBySellerOrderByUpdatedAtDesc(seller, pageable)
                .map(this::mapProduct);
    }

    @Transactional
    public SellerDto.SellerProductResponse createProduct(String email, ProductDto dto) {
        User seller = getSeller(email);
        Product product = productService.applyProductDetails(dto, new Product());
        product.setSeller(seller);
        product.setActive(dto.isActive());
        product.setApprovalStatus(ProductApprovalStatus.DRAFT);
        product.setAiReviewScore(null);
        product.setAiReviewSummary(null);
        product.setAiReviewIssues(null);
        product.setAiRecommendation(null);
        product.setAdminNotes(null);
        product.setSubmittedAt(null);
        product.setReviewedAt(null);
        return mapProduct(productRepository.save(product));
    }

    @Transactional
    public SellerDto.SellerProductResponse updateProduct(String email, Long id, ProductDto dto) {
        Product product = getOwnedProduct(email, id);
        productService.applyProductDetails(dto, product);
        product.setActive(dto.isActive());
        product.setApprovalStatus(ProductApprovalStatus.DRAFT);
        product.setAiReviewScore(null);
        product.setAiReviewSummary(null);
        product.setAiReviewIssues(null);
        product.setAiRecommendation(null);
        product.setSubmittedAt(null);
        product.setReviewedAt(null);
        return mapProduct(productRepository.save(product));
    }

    @Transactional
    public SellerDto.SellerProductResponse submitProduct(String email, Long id) {
        Product product = getOwnedProduct(email, id);
        SellerProfile profile = getApprovedProfile(product.getSeller());

        if (profile.getStatus() != SellerApprovalStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seller profile must be approved before submitting products");
        }

        AiVerificationService.ReviewResult review = aiVerificationService.reviewProduct(product);
        product.setAiReviewScore(review.score());
        product.setAiReviewSummary(review.summary());
        product.setAiReviewIssues(String.join("\n", review.issues()));
        product.setAiRecommendation(review.recommendation());
        product.setApprovalStatus(ProductApprovalStatus.PENDING_REVIEW);
        product.setSubmittedAt(LocalDateTime.now());

        return mapProduct(productRepository.save(product));
    }

    @Transactional(readOnly = true)
    public SellerProfile getApprovedProfile(User seller) {
        return sellerProfileRepository.findByUser(seller)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Complete your seller profile first"));
    }

    private User getSeller(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getRole() != Role.SELLER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seller access required");
        }

        return user;
    }

    private Product getOwnedProduct(String email, Long id) {
        User seller = getSeller(email);
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this product");
        }

        return product;
    }

    private SellerProfile getOrCreateProfile(User seller) {
        return sellerProfileRepository.findByUser(seller)
                .orElseGet(() -> sellerProfileRepository.save(SellerProfile.builder()
                        .user(seller)
                        .businessName(seller.getFullName() == null ? "" : seller.getFullName().trim())
                        .status(SellerApprovalStatus.DRAFT)
                        .build()));
    }

    private void applyReview(SellerProfile profile, AiVerificationService.ReviewResult review) {
        profile.setAiReviewScore(review.score());
        profile.setAiReviewSummary(review.summary());
        profile.setAiReviewIssues(String.join("\n", review.issues()));
        profile.setAiRecommendation(review.recommendation());
    }

    SellerDto.SellerProfileResponse mapProfile(SellerProfile profile) {
        SellerDto.SellerProfileResponse response = new SellerDto.SellerProfileResponse();
        response.setId(profile.getId());
        response.setUserId(profile.getUser().getId());
        response.setEmail(profile.getUser().getEmail());
        response.setFullName(profile.getUser().getFullName());
        response.setBusinessName(profile.getBusinessName());
        response.setBusinessType(profile.getBusinessType());
        response.setTaxId(profile.getTaxId());
        response.setWebsite(profile.getWebsite());
        response.setDescription(profile.getDescription());
        response.setAddress(profile.getAddress());
        response.setDocumentUrl(profile.getDocumentUrl());
        response.setStatus(profile.getStatus().name());
        response.setAiReviewScore(profile.getAiReviewScore());
        response.setAiReviewSummary(profile.getAiReviewSummary());
        response.setAiReviewIssues(splitIssues(profile.getAiReviewIssues()));
        response.setAiRecommendation(profile.getAiRecommendation());
        response.setAdminNotes(profile.getAdminNotes());
        response.setSubmittedAt(profile.getSubmittedAt());
        response.setReviewedAt(profile.getReviewedAt());
        response.setUpdatedAt(profile.getUpdatedAt());
        return response;
    }

    SellerDto.SellerProductResponse mapProduct(Product product) {
        productService.prepareProductForResponse(product);

        SellerDto.SellerProductResponse response = new SellerDto.SellerProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice());
        response.setOriginalPrice(product.getOriginalPrice());
        response.setStock(product.getStock());
        response.setCategory(product.getCategory());
        response.setBrand(product.getBrand());
        response.setSku(product.getSku());
        response.setMainImageUrl(product.getMainImageUrl());
        response.setImages(product.getImages() == null ? List.of() : product.getImages().stream()
                .map(image -> image.getImageUrl())
                .collect(Collectors.toList()));
        response.setActive(product.isActive());
        response.setApprovalStatus(product.getApprovalStatus() == null ? null : product.getApprovalStatus().name());
        response.setAiReviewScore(product.getAiReviewScore());
        response.setAiReviewSummary(product.getAiReviewSummary());
        response.setAiReviewIssues(splitIssues(product.getAiReviewIssues()));
        response.setAiRecommendation(product.getAiRecommendation());
        response.setAdminNotes(product.getAdminNotes());
        response.setSubmittedAt(product.getSubmittedAt());
        response.setReviewedAt(product.getReviewedAt());
        response.setUpdatedAt(product.getUpdatedAt());
        if (product.getSeller() != null) {
            response.setSellerId(product.getSeller().getId());
            response.setSellerName(product.getSeller().getFullName());
            response.setSellerEmail(product.getSeller().getEmail());
        }
        return response;
    }

    private List<String> splitIssues(String issues) {
        if (issues == null || issues.isBlank()) {
            return List.of();
        }
        return Arrays.stream(issues.split("\\R"))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toList());
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String trimToEmpty(String value, String fallback) {
        if (value != null && !value.isBlank()) {
            return value.trim();
        }
        return fallback == null ? "" : fallback.trim();
    }
}
