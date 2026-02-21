package com.luxe.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderDto {

    @Data
    public static class CreateOrderRequest {
        @NotBlank
        private String shippingAddress;
        private String paymentMethod = "COD";
    }

    @Data
    public static class OrderItemResponse {
        private Long productId;
        private String productName;
        private String productImage;
        private Integer quantity;
        private BigDecimal price;
    }

    @Data
    public static class OrderResponse {
        private Long id;
        private String status;
        private BigDecimal totalAmount;
        private String shippingAddress;
        private String paymentMethod;
        private String trackingNumber;
        private List<OrderItemResponse> items;
        private LocalDateTime createdAt;
    }

    @Data
    public static class UpdateStatusRequest {
        private String status;
    }
}
