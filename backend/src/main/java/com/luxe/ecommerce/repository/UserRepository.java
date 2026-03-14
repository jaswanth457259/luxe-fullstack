package com.luxe.ecommerce.repository;

import com.luxe.ecommerce.model.Role;
import com.luxe.ecommerce.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByGoogleId(String googleId);

    boolean existsByEmail(String email);

    Optional<User> findByRole(Role role);

    long countByRole(Role role);
}
