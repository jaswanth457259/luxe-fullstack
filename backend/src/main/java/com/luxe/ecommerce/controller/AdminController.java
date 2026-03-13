package com.luxe.ecommerce.controller;

import com.luxe.ecommerce.dto.ProductImportResult;
import com.luxe.ecommerce.model.Order;
import com.luxe.ecommerce.repository.OrderRepository;
import com.luxe.ecommerce.repository.ProductRepository;
import com.luxe.ecommerce.repository.UserRepository;
import com.luxe.ecommerce.service.ProductCsvImportService;
import lombok.RequiredArgsConstructor;
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

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userRepository.count(),
                "totalProducts", productRepository.countByActiveTrue(),
                "totalOrders", orderRepository.count(),
                "pendingOrders", orderRepository.countByStatus(Order.OrderStatus.PENDING),
                "shippedOrders", orderRepository.countByStatus(Order.OrderStatus.SHIPPED),
                "deliveredOrders", orderRepository.countByStatus(Order.OrderStatus.DELIVERED)));
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
