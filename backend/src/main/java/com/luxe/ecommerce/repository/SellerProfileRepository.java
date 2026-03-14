package com.luxe.ecommerce.repository;

import com.luxe.ecommerce.model.SellerApprovalStatus;
import com.luxe.ecommerce.model.SellerProfile;
import com.luxe.ecommerce.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerProfileRepository extends JpaRepository<SellerProfile, Long> {

    Optional<SellerProfile> findByUser(User user);

    Optional<SellerProfile> findByUserEmail(String email);

    Page<SellerProfile> findByStatusOrderBySubmittedAtAsc(SellerApprovalStatus status, Pageable pageable);

    long countByStatus(SellerApprovalStatus status);
}
