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
    private final ProductRepository productRepository;

    // ==============================
    // PLACE ORDER (WITH STOCK LOGIC)
    // ==============================
    @Transactional
    public OrderDto.OrderResponse placeOrder(String email, OrderDto.CreateOrderRequest request) {

        User user = getUser(email);
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty())
            throw new RuntimeException("Cart is empty");

        BigDecimal total = BigDecimal.ZERO;

        // 🔒 Validate & Deduct Stock
        for (CartItem cartItem : cartItems) {

            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException(
                        "Not enough stock for product: " + product.getName());
            }

            // Deduct stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);

            total = total.add(
                    product.getPrice()
                            .multiply(BigDecimal.valueOf(cartItem.getQuantity()))
            );
        }

        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod(request.getPaymentMethod())
                .status(Order.OrderStatus.PENDING)
                .build();

        List<OrderItem> orderItems = cartItems.stream()
                .map(cartItem -> OrderItem.builder()
                        .order(order)
                        .product(cartItem.getProduct())
                        .quantity(cartItem.getQuantity())
                        .price(cartItem.getProduct().getPrice())
                        .build())
                .collect(Collectors.toList());

        order.setItems(orderItems);

        Order saved = orderRepository.save(order);

        cartItemRepository.deleteByUser(user);

        return mapToResponse(saved);
    }

    // ==============================
    // USER ORDERS
    // ==============================
    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getUserOrders(String email, Pageable pageable) {
        User user = getUser(email);
        return orderRepository
                .findByUserOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public OrderDto.OrderResponse getOrderById(Long id, String email) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getEmail().equals(email)) {
            throw new RuntimeException("Access denied");
        }

        return mapToResponse(order);
    }

    // ==============================
    // ADMIN
    // ==============================
    @Transactional(readOnly = true)
    public Page<OrderDto.OrderResponse> getAllOrders(Pageable pageable) {
        return orderRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public OrderDto.OrderResponse updateOrderStatus(Long id, String status) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus newStatus =
                Order.OrderStatus.valueOf(status.toUpperCase());

        // 🔄 If cancelling → restore stock
        if (newStatus == Order.OrderStatus.CANCELLED &&
                order.getStatus() != Order.OrderStatus.CANCELLED) {

            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        order.setStatus(newStatus);

        return mapToResponse(orderRepository.save(order));
    }

    // ==============================
    // MAPPER
    // ==============================
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