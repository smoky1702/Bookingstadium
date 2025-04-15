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
                Roles role = new Roles();
                role.setRoleId("ADMIN");
                roleRepository.save(role);
            }

            if(roleRepository.findById("OWNER").isEmpty()){
                Roles role = new Roles();
                role.setRoleId("OWNER");
                roleRepository.save(role);
            }

            if(roleRepository.findById("USER").isEmpty()){
                Roles role = new Roles();
                role.setRoleId("USER");
                roleRepository.save(role);
            }

            Roles roles = roleRepository.findById("ADMIN")
                    .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_EXISTED));

            // Kiểm tra xem user admin đã tồn tại chưa, nếu chưa thì tạo
            if (userRepository.findByRole(roles).isEmpty()) {
                Users user = Users.builder()
                        .email("admin@example.com")
                        .role(roles)
                        .firstname("admin")
                        .lastname("admin")
                        .password(passwordEncoder.encode("admin123"))
                        .phone("0123456789")
                        .day_of_birth(LocalDate.now())
                        .date_created(LocalDate.now())
                        .build();
                userRepository.save(user);
                log.warn("admin user has been created with default password: admin, please change it");
            }
            log.info("Application initialization completed .....");
        };
    }
}