package com.luxe.ecommerce.controller;

import com.luxe.ecommerce.dto.CartDto;
import com.luxe.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDto.CartResponse> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(cartService.getCart(userDetails.getUsername()));
    }

    @PostMapping
    public ResponseEntity<CartDto.CartResponse> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody CartDto.CartItemRequest request) {
        return ResponseEntity.ok(cartService.addToCart(userDetails.getUsername(), request));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<CartDto.CartResponse> updateItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long itemId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateCartItem(userDetails.getUsername(), itemId, quantity));
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        cartService.clearCart(userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}
