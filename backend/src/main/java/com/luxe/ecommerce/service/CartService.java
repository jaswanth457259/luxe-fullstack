package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.CartDto;
import com.luxe.ecommerce.model.CartItem;
import com.luxe.ecommerce.model.Product;
import com.luxe.ecommerce.model.User;
import com.luxe.ecommerce.repository.CartItemRepository;
import com.luxe.ecommerce.repository.ProductRepository;
import com.luxe.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartDto.CartResponse getCart(String email) {
        User user = getUser(email);
        List<CartItem> items = cartItemRepository.findByUser(user);
        return buildCartResponse(items);
    }

    @Transactional
    public CartDto.CartResponse addToCart(String email, CartDto.CartItemRequest request) {
        User user = getUser(email);
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existing = cartItemRepository.findByUserAndProduct(user, product);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            CartItem item = CartItem.builder()
                    .user(user).product(product).quantity(request.getQuantity()).build();
            cartItemRepository.save(item);
        }
        return getCart(email);
    }

    @Transactional
    public CartDto.CartResponse updateCartItem(String email, Long itemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return getCart(email);
    }

    @Transactional
    public void clearCart(String email) {
        User user = getUser(email);
        cartItemRepository.deleteByUser(user);
    }

    private CartDto.CartResponse buildCartResponse(List<CartItem> items) {
        List<CartDto.CartItemResponse> itemResponses = items.stream().map(item -> {
            CartDto.CartItemResponse r = new CartDto.CartItemResponse();
            r.setId(item.getId());
            r.setProductId(item.getProduct().getId());
            r.setProductName(item.getProduct().getName());
            r.setProductImage(item.getProduct().getImageUrl());
            r.setPrice(item.getProduct().getPrice());
            r.setQuantity(item.getQuantity());
            r.setSubtotal(item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            return r;
        }).collect(Collectors.toList());

        BigDecimal total = itemResponses.stream()
                .map(CartDto.CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CartDto.CartResponse response = new CartDto.CartResponse();
        response.setItems(itemResponses);
        response.setTotal(total);
        response.setItemCount(items.stream().mapToInt(CartItem::getQuantity).sum());
        return response;
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
}
