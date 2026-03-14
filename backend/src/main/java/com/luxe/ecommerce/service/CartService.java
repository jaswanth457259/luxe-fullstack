package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.CartDto;
import com.luxe.ecommerce.model.CartItem;
import com.luxe.ecommerce.model.Product;
import com.luxe.ecommerce.model.ProductApprovalStatus;
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

    @Transactional
    public CartDto.CartResponse getCart(String email) {
        User user = getUser(email);
        List<CartItem> items = cartItemRepository.findByUser(user);
        List<CartItem> activeItems = pruneInactiveItems(items);
        return buildCartResponse(activeItems);
    }

    @Transactional
    public CartDto.CartResponse addToCart(String email, CartDto.CartItemRequest request) {
        User user = getUser(email);
        Product product = productRepository.findPublicById(request.getProductId())
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
        if (!isPurchasable(item.getProduct())) {
            cartItemRepository.delete(item);
            return getCart(email);
        }
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

    private List<CartItem> pruneInactiveItems(List<CartItem> items) {
        List<CartItem> inactiveItems = items.stream()
                .filter(item -> !isPurchasable(item.getProduct()))
                .collect(Collectors.toList());

        if (!inactiveItems.isEmpty()) {
            inactiveItems.forEach(cartItemRepository::delete);
        }

        return items.stream()
                .filter(item -> isPurchasable(item.getProduct()))
                .collect(Collectors.toList());
    }

    private CartDto.CartResponse buildCartResponse(List<CartItem> items) {
        List<CartDto.CartItemResponse> itemResponses = items.stream().map(item -> {
            CartDto.CartItemResponse r = new CartDto.CartItemResponse();
            r.setId(item.getId());
            r.setProductId(item.getProduct().getId());
            r.setProductName(item.getProduct().getName());
            r.setProductImage(item.getProduct().getMainImageUrl());
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

    private boolean isPurchasable(Product product) {
        return product.isActive()
                && (product.getApprovalStatus() == null || product.getApprovalStatus() == ProductApprovalStatus.APPROVED);
    }
}
