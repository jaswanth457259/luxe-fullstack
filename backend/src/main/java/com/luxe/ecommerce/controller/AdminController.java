package com.luxe.ecommerce.controller;

import com.luxe.ecommerce.model.Order;
import com.luxe.ecommerce.repository.OrderRepository;
import com.luxe.ecommerce.repository.ProductRepository;
import com.luxe.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(Map.of(
                "totalUsers", userRepository.count(),
                "totalProducts", productRepository.count(),
                "totalOrders", orderRepository.count(),
                "pendingOrders", orderRepository.countByStatus(Order.OrderStatus.PENDING),
                "shippedOrders", orderRepository.countByStatus(Order.OrderStatus.SHIPPED),
                "deliveredOrders", orderRepository.countByStatus(Order.OrderStatus.DELIVERED)));
    }
}
