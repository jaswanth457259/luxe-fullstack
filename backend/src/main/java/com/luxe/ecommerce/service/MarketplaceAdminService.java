package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.SellerDto;
import com.luxe.ecommerce.model.Product;
import com.luxe.ecommerce.model.ProductApprovalStatus;
import com.luxe.ecommerce.model.SellerApprovalStatus;
import com.luxe.ecommerce.model.SellerProfile;
import com.luxe.ecommerce.repository.ProductRepository;
import com.luxe.ecommerce.repository.SellerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class MarketplaceAdminService {

    private final SellerProfileRepository sellerProfileRepository;
    private final ProductRepository productRepository;
    private final SellerService sellerService;

    @Transactional(readOnly = true)
    public Page<SellerDto.SellerProfileResponse> getPendingSellerProfiles(Pageable pageable) {
        return sellerProfileRepository.findByStatusOrderBySubmittedAtAsc(SellerApprovalStatus.PENDING_REVIEW, pageable)
                .map(sellerService::mapProfile);
    }

    @Transactional(readOnly = true)
    public Page<SellerDto.SellerProductResponse> getPendingProducts(Pageable pageable) {
        return productRepository.findByApprovalStatusOrderBySubmittedAtAsc(ProductApprovalStatus.PENDING_REVIEW, pageable)
                .map(sellerService::mapProduct);
    }

    @Transactional
    public SellerDto.SellerProfileResponse reviewSeller(Long id, SellerDto.ReviewDecisionRequest request) {
        SellerProfile profile = sellerProfileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Seller profile not found"));

        profile.setStatus(request.isApproved() ? SellerApprovalStatus.APPROVED : SellerApprovalStatus.REJECTED);
        profile.setAdminNotes(request.getAdminNotes());
        profile.setReviewedAt(LocalDateTime.now());

        return sellerService.mapProfile(sellerProfileRepository.save(profile));
    }

    @Transactional
    public SellerDto.SellerProductResponse reviewProduct(Long id, SellerDto.ReviewDecisionRequest request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        product.setApprovalStatus(request.isApproved() ? ProductApprovalStatus.APPROVED : ProductApprovalStatus.REJECTED);
        product.setAdminNotes(request.getAdminNotes());
        product.setReviewedAt(LocalDateTime.now());

        return sellerService.mapProduct(productRepository.save(product));
    }
}
