package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.ProductDto;
import com.luxe.ecommerce.model.Product;
import com.luxe.ecommerce.model.ProductImage;
import com.luxe.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable)
                .map(this::prepareProductForResponse);
    }

    @Transactional(readOnly = true)
    public Page<Product> getByCategory(String category, Pageable pageable) {
        return productRepository.findByCategoryAndActiveTrue(category, pageable)
                .map(this::prepareProductForResponse);
    }

    @Transactional(readOnly = true)
    public Page<Product> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProducts(query, pageable)
                .map(this::prepareProductForResponse);
    }

    @Transactional(readOnly = true)
    public Product getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return prepareProductForResponse(product);
    }

    public List<String> getAllCategories() {
        return productRepository.findAllCategories();
    }

    public Product createProduct(ProductDto dto) {
        Product product = mapToEntity(dto, new Product());
        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductDto dto) {
        Product product = getById(id);
        mapToEntity(dto, product);
        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {
        Product product = getById(id);
        product.setActive(false);
        productRepository.save(product);
    }

    private Product mapToEntity(ProductDto dto, Product product) {

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setOriginalPrice(dto.getOriginalPrice());
        product.setStock(dto.getStock());
        product.setCategory(dto.getCategory());
        product.setBrand(dto.getBrand());
        product.setSku(dto.getSku());
        product.setMainImageUrl(dto.getMainImageUrl());
        product.setActive(dto.isActive());

        if (dto.getImages() != null) {

            List<ProductImage> images = dto.getImages()
                    .stream()
                    .map(url -> ProductImage.builder()
                            .imageUrl(url)
                            .product(product)
                            .build())
                    .toList();

            product.setImages(images);

            if ((product.getMainImageUrl() == null || product.getMainImageUrl().isBlank()) && !dto.getImages().isEmpty()) {
                product.setMainImageUrl(dto.getImages().get(0));
            }
        }

        return product;
    }

    private Product prepareProductForResponse(Product product) {
        if (product.getImages() != null) {
            product.getImages().size();

            if ((product.getMainImageUrl() == null || product.getMainImageUrl().isBlank())
                    && !product.getImages().isEmpty()) {
                product.setMainImageUrl(product.getImages().get(0).getImageUrl());
            }
        }

        return product;
    }
}
