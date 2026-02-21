package com.luxe.ecommerce.service;

import com.luxe.ecommerce.dto.ProductDto;
import com.luxe.ecommerce.model.Product;
import com.luxe.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }

    public Page<Product> getByCategory(String category, Pageable pageable) {
        return productRepository.findByCategoryAndActiveTrue(category, pageable);
    }

    public Page<Product> searchProducts(String query, Pageable pageable) {
        return productRepository.searchProducts(query, pageable);
    }

    public Product getById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
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
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(dto.getCategory());
        product.setBrand(dto.getBrand());
        product.setSku(dto.getSku());
        product.setActive(dto.isActive());
        return product;
    }
}
