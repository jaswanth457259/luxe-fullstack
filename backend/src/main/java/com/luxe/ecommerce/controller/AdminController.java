package com.luxe.ecommerce.controller;

import com.luxe.ecommerce.dto.ProductImportResult;
import com.luxe.ecommerce.dto.SellerDto;
import com.luxe.ecommerce.model.Order;
import com.luxe.ecommerce.model.ProductApprovalStatus;
import com.luxe.ecommerce.model.Role;
import com.luxe.ecommerce.model.SellerApprovalStatus;
import com.luxe.ecommerce.repository.OrderRepository;
import com.luxe.ecommerce.repository.ProductRepository;
import com.luxe.ecommerce.repository.UserRepository;
import com.luxe.ecommerce.service.MarketplaceAdminService;
import com.luxe.ecommerce.service.ProductCsvImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ProductCsvImportService productCsvImportService;
    private final MarketplaceAdminService marketplaceAdminService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userRepository.count(),
                "totalSellers", userRepository.countByRole(Role.SELLER),
                "totalProducts", productRepository.countByActiveTrue(),
                "pendingSellerApplications", marketplaceAdminService.getPendingSellerProfiles(PageRequest.of(0, 1)).getTotalElements(),
                "pendingProductReviews", productRepository.countByApprovalStatus(ProductApprovalStatus.PENDING_REVIEW),
                "totalOrders", orderRepository.count(),
                "pendingOrders", orderRepository.countByStatus(Order.OrderStatus.PENDING),
                "shippedOrders", orderRepository.countByStatus(Order.OrderStatus.SHIPPED),
                "deliveredOrders", orderRepository.countByStatus(Order.OrderStatus.DELIVERED)));
    }

    @GetMapping("/reviews/sellers")
    public ResponseEntity<Page<SellerDto.SellerProfileResponse>> getPendingSellerReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(marketplaceAdminService.getPendingSellerProfiles(PageRequest.of(page, size)));
    }

    @PostMapping("/reviews/sellers/{id}/decision")
    public ResponseEntity<SellerDto.SellerProfileResponse> reviewSeller(
            @PathVariable Long id,
            @RequestBody SellerDto.ReviewDecisionRequest request) {
        return ResponseEntity.ok(marketplaceAdminService.reviewSeller(id, request));
    }

    @GetMapping("/reviews/products")
    public ResponseEntity<Page<SellerDto.SellerProductResponse>> getPendingProductReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(marketplaceAdminService.getPendingProducts(PageRequest.of(page, size)));
    }

    @PostMapping("/reviews/products/{id}/decision")
    public ResponseEntity<SellerDto.SellerProductResponse> reviewProduct(
            @PathVariable Long id,
            @RequestBody SellerDto.ReviewDecisionRequest request) {
        return ResponseEntity.ok(marketplaceAdminService.reviewProduct(id, request));
    }

    @PostMapping(value = "/products/import-csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductImportResult> importProducts(@RequestParam("file") MultipartFile file) {
        try {
            return ResponseEntity.ok(productCsvImportService.importProducts(file));
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(org.springframework.http.HttpStatus.BAD_REQUEST, ex.getMessage(), ex);
        }
    }
}
