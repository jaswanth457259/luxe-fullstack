package com.luxe.ecommerce.controller;

import com.luxe.ecommerce.dto.ProductDto;
import com.luxe.ecommerce.dto.SellerDto;
import com.luxe.ecommerce.service.SellerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/seller")
@PreAuthorize("hasRole('SELLER')")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;

    @GetMapping("/profile")
    public ResponseEntity<SellerDto.SellerProfileResponse> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(sellerService.getMyProfile(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<SellerDto.SellerProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody SellerDto.SellerProfileRequest request) {
        return ResponseEntity.ok(sellerService.upsertProfile(userDetails.getUsername(), request));
    }

    @GetMapping("/products")
    public ResponseEntity<Page<SellerDto.SellerProductResponse>> getProducts(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(sellerService.getMyProducts(userDetails.getUsername(), PageRequest.of(page, size)));
    }

    @PostMapping("/products")
    public ResponseEntity<SellerDto.SellerProductResponse> createProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ProductDto dto) {
        return ResponseEntity.ok(sellerService.createProduct(userDetails.getUsername(), dto));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<SellerDto.SellerProductResponse> updateProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody ProductDto dto) {
        return ResponseEntity.ok(sellerService.updateProduct(userDetails.getUsername(), id, dto));
    }

    @PostMapping("/products/{id}/submit")
    public ResponseEntity<SellerDto.SellerProductResponse> submitProduct(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(sellerService.submitProduct(userDetails.getUsername(), id));
    }
}
