package com.luxe.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductDto {
    private Long id;

    @NotBlank
    private String name;

    private String description;

    @NotNull @PositiveOrZero
    private BigDecimal price;

    private BigDecimal originalPrice;

    @NotNull @PositiveOrZero
    private Integer stock;

    private String imageUrl;
    private String category;
    private String brand;
    private String sku;
    private boolean active = true;
    private Double rating;
    private Integer reviewCount;
}
