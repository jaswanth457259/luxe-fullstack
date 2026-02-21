package com.luxe.ecommerce;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "app.jwt.secret=TestSecretKeyForJWTTokenGenerationAtLeast256BitsLong1234567890",
    "app.jwt.expiration=86400000"
})
class LuxeApplicationTests {
    @Test
    void contextLoads() {}
}
