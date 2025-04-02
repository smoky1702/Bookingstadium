package com.example.bookingStadium.config;

import com.example.bookingStadium.entity.Roles;
import com.example.bookingStadium.entity.Users;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.repository.RoleRepository;
import com.example.bookingStadium.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.dao.OptimisticLockingFailureException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.boot.ApplicationRunner;

import java.time.LocalDate;

@RequiredArgsConstructor
@Configuration
@Slf4j
public class ApplicationInitConfig {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder; // Để mã hóa mật khẩu

    @Bean
    ApplicationRunner applicationRunner() {
        return args -> {
            // Kiểm tra xem role ADMIN đã tồn tại chưa, nếu chưa thì tạo
            if (roleRepository.findById("ADMIN").isEmpty()) {
                Roles adminRole = new Roles();
                adminRole.setRoleId("ADMIN");
                roleRepository.save(adminRole);
            }

            Roles roles = roleRepository.findById("ADMIN")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

            // Kiểm tra xem user admin đã tồn tại chưa, nếu chưa thì tạo
            if (userRepository.findByRole(roles).isEmpty()) {
                Users adminUser = new Users();
                adminUser.setUser_id(java.util.UUID.randomUUID().toString()); // Tạo user_id random
                adminUser.setEmail("admin@example.com");
                adminUser.setFirstname("Admin");
                adminUser.setLastname("Admin");
                adminUser.setPassword(passwordEncoder.encode("admin123")); // Mã hóa mật khẩu
                adminUser.setPhone("0123456789");
                adminUser.setDay_of_birth(LocalDate.now());
                adminUser.setDate_created(LocalDate.now());
                adminUser.setRole(roles); // Gán role ADMIN

                try {
                    // logic để lưu user
                    userRepository.save(adminUser);
                } catch (OptimisticLockingFailureException e) {
                    // xử lý ngoại lệ
                    log.error("Optimistic locking failure", e);
                    // thực hiện các hành động cần thiết
                }
            }
        };
    }
}