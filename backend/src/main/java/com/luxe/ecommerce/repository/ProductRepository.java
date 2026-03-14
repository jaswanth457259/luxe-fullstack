package com.luxe.ecommerce.repository;

import com.luxe.ecommerce.model.Product;
import com.luxe.ecommerce.model.ProductApprovalStatus;
import com.luxe.ecommerce.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Query("""
            SELECT p FROM Product p
            WHERE p.active = true
              AND (p.approvalStatus = com.luxe.ecommerce.model.ProductApprovalStatus.APPROVED OR p.approvalStatus IS NULL)
            """)
    Page<Product> findPublicProducts(Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            WHERE p.active = true
              AND p.category = :category
              AND (p.approvalStatus = com.luxe.ecommerce.model.ProductApprovalStatus.APPROVED OR p.approvalStatus IS NULL)
            """)
    Page<Product> findPublicProductsByCategory(@Param("category") String category, Pageable pageable);

    @Query("""
            SELECT p FROM Product p
            WHERE p.id = :id
              AND p.active = true
              AND (p.approvalStatus = com.luxe.ecommerce.model.ProductApprovalStatus.APPROVED OR p.approvalStatus IS NULL)
            """)
    Optional<Product> findPublicById(@Param("id") Long id);

    @Query("""
            SELECT p FROM Product p
            WHERE p.active = true
              AND (p.approvalStatus = com.luxe.ecommerce.model.ProductApprovalStatus.APPROVED OR p.approvalStatus IS NULL)
              AND (
                    LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(p.brand) LIKE LOWER(CONCAT('%', :q, '%'))
                 OR LOWER(p.category) LIKE LOWER(CONCAT('%', :q, '%'))
              )
            """)
    Page<Product> searchProducts(@Param("q") String query, Pageable pageable);

    List<String> findDistinctCategoryByActiveTrue();

    @Query("""
            SELECT DISTINCT p.category FROM Product p
            WHERE p.active = true
              AND (p.approvalStatus = com.luxe.ecommerce.model.ProductApprovalStatus.APPROVED OR p.approvalStatus IS NULL)
            """)
    List<String> findAllCategories();

    Optional<Product> findBySku(String sku);

    long countByActiveTrue();

    long countByApprovalStatus(ProductApprovalStatus approvalStatus);

    Page<Product> findBySellerOrderByUpdatedAtDesc(User seller, Pageable pageable);

    Page<Product> findByApprovalStatusOrderBySubmittedAtAsc(ProductApprovalStatus approvalStatus, Pageable pageable);
}
