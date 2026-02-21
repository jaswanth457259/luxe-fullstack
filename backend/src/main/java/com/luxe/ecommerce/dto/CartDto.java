package com.luxe.ecommerce.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

public class CartDto {

    @Data
    public static class CartItemRequest {
        private Long productId;
        private Integer quantity;
    }

    @Data
    public static class CartItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImage;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal subtotal;
    }

    @Data
    public static class CartResponse {
        private List<CartItemResponse> items;
        private BigDecimal total;
        private Integer itemCount;
    }
}
