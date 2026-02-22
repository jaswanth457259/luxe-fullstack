package com.luxe.ecommerce;

import com.luxe.ecommerce.model.Role;
import com.luxe.ecommerce.model.User;
import com.luxe.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (userRepository.findByRole(Role.ADMIN).isEmpty()) {

            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@luxe.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);

            userRepository.save(admin);

            System.out.println("✅ Default Admin Created");
        }
    }
}