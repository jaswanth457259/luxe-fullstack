package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.OrderDto;
import com.luxe.ecommerce.model.*;
import com.luxe.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderDto.OrderResponse placeOrder(String email, OrderDto.CreateOrderRequest request) {
        User user = getUser(email);
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) throw new RuntimeException("Cart is empty");

        BigDecimal total = cartItems.stream()
                .map(i -> i.getProduct().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .status(Order.OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = cartItems.stream().map(cartItem -> OrderItem.builder()
                .order(order)
                .product(cartItem.getProduct())
                .quantity(cartItem.getQuantity())
                .price(cartItem.getProduct().getPrice())
                .build()).collect(Collectors.toList());

        order.setItems(orderItems);
        Order saved = orderRepository.save(order);
        cartItemRepository.deleteByUser(user);
        return mapToResponse(saved);
    }

    public Page<OrderDto.OrderResponse> getUserOrders(String email, Pageable pageable) {
        User user = getUser(email);
        return orderRepository.findByUserOrderByCreatedAtDesc(user, pageable).map(this::mapToResponse);
    }

    public OrderDto.OrderResponse getOrderById(Long id, String email) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToResponse(order);
    }

    public Page<OrderDto.OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::mapToResponse);
    }

    @Transactional
    public OrderDto.OrderResponse updateOrderStatus(Long id, String status) {
        Order order = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        return mapToResponse(orderRepository.save(order));
    }

    private OrderDto.OrderResponse mapToResponse(Order order) {
        OrderDto.OrderResponse r = new OrderDto.OrderResponse();
        r.setId(order.getId());
        r.setStatus(order.getStatus().name());
        r.setTotalAmount(order.getTotalAmount());
        r.setShippingAddress(order.getShippingAddress());
        r.setPaymentMethod(order.getPaymentMethod());
        r.setTrackingNumber(order.getTrackingNumber());
        r.setCreatedAt(order.getCreatedAt());
        r.setItems(order.getItems().stream().map(item -> {
            OrderDto.OrderItemResponse ir = new OrderDto.OrderItemResponse();
            ir.setProductId(item.getProduct().getId());
            ir.setProductName(item.getProduct().getName());
            ir.setProductImage(item.getProduct().getImageUrl());
            ir.setQuantity(item.getQuantity());
            ir.setPrice(item.getPrice());
            return ir;
        }).collect(Collectors.toList()));
        return r;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
