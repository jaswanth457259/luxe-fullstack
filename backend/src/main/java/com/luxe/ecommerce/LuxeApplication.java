package com.luxe.ecommerce;

import com.luxe.ecommerce.model.User;
import com.luxe.ecommerce.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class LuxeApplication {

    public static void main(String[] args) {
        SpringApplication.run(LuxeApplication.class, args);
    }

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {

            if (userRepository.count() == 0) {

                User admin = new User();
                admin.setFullName("Admin");
                admin.setEmail("admin@luxe.com");
                admin.setPassword(passwordEncoder.encode("Admin@123"));
                admin.setRole(User.Role.ADMIN); // ✅ FIXED
                admin.setEnabled(true);

                userRepository.save(admin);

                System.out.println("🔥 ADMIN CREATED SUCCESSFULLY");
            }
        };
    }
}