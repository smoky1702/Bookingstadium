package com.example.bookingStadium.config;

import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

import javax.crypto.spec.SecretKeySpec;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final String[] PUBLIC_ENDPOINTS = {"/users", "/auth/login", "/auth/token"
            , "/auth/introspect", "/users/owner"};

    @NonFinal
    @Value("${jwt.signerKey}")
    private String SIGNER_KEY;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        // Vô hiệu hóa CSRF
        httpSecurity.csrf(csrf -> csrf.disable());

        httpSecurity.authorizeHttpRequests(request ->
                request
                        // PUBLIC API (ai cũng truy cập được)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(HttpMethod.POST, PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.GET, "/type", "/PaymentMethod", "/location", "/stadium", "/stadium/{stadiumId}", "/images", "/WorkSchedule", "/evaluation", "/evaluation/{evaluationId}").permitAll()
                        // Cho phép truy cập thư mục uploads không cần xác thực
                        .requestMatchers("/uploads/**").permitAll()

                        // API USER
                        .requestMatchers(HttpMethod.GET, "/users/{userId}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/users/me").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/users/{userId}").authenticated()

                        // lịch sử đặt sân vs bill
                        .requestMatchers(HttpMethod.GET, "/users/{userId}/bookings", "/users/{userId}/bills").authenticated()
                        .requestMatchers(HttpMethod.GET, "/users/me/bookings", "/users/me/bills").authenticated()

                        .requestMatchers(HttpMethod.GET, "/bill/{billId}").authenticated()
                        .requestMatchers(HttpMethod.POST,"/bill/user").hasAuthority("SCOPE_USER")
                        .requestMatchers(HttpMethod.PUT, "/bill/update/{billId}").hasAnyAuthority("SCOPE_USER", "SCOPE_OWNER")

                        .requestMatchers(HttpMethod.GET, "/bill/{billId}").authenticated() //Chỉnh sửa service
                        .requestMatchers(HttpMethod.POST,"/bill").hasAnyAuthority("SCOPE_USER")
                        //.requestMatchers(HttpMethod.PUT, "/bill/update/{billId}").hasAnyAuthority("SCOPE_USER")

                        // API ADMIN
                        .requestMatchers(HttpMethod.GET, "/users").hasAuthority("SCOPE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/users/{userId}").hasAuthority("SCOPE_ADMIN")
                        .requestMatchers(HttpMethod.POST, "/type", "/PaymentMethod").hasAuthority("SCOPE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/type/{typeId}", "/PaymentMethod/{PaymentMethodId}").hasAuthority("SCOPE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/type/{typeId}", "/PaymentMethod/{PaymentMethodId}").hasAuthority("SCOPE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/users/role/{userId}").hasAuthority("SCOPE_ADMIN")

                        // API OWNER
                        .requestMatchers(HttpMethod.POST, "/location", "/stadium", "/images/upload"
                                , "/WorkSchedule", "/bill/owner").hasAuthority("SCOPE_OWNER")
                        .requestMatchers(HttpMethod.PUT, "/location/{locationId}", "/stadium/{stadiumId}"
                                , "/images/update/{imageId}", "/WorkSchedule/{WorkScheduleId}", "/bill/paid/{billId}").hasAuthority("SCOPE_OWNER")
                        .requestMatchers(HttpMethod.DELETE, "/location/{locationId}", "/stadium/{stadiumId}"
                                , "/images/upload/{imageId}", "/WorkSchedule/{WorkScheduleId}", "/bill/{billId}").hasAuthority("SCOPE_OWNER")
                        .requestMatchers(HttpMethod.GET, "/bill").hasAnyAuthority
                                ("SCOPE_OWNER", "SCOPE_ADMIN")

                        // BOOKING, DETAILS
                        .requestMatchers(HttpMethod.POST, "/booking", "/details").authenticated()
                        .requestMatchers(HttpMethod.GET, "/booking/{bookingId}"
                                , "/details/{stadiumBookingDetailId}").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/booking/{bookingId}"
                                , "/details/{stadiumBookingDetailId}").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/booking/{bookingId}"
                                , "/details/{stadiumBookingDetailId}").authenticated()
                        .requestMatchers(HttpMethod.GET, "/stadium/{stadiumId}/booking/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/booking", "/details").hasAuthority("SCOPE_ADMIN")

                        // EVALUATION
                        .requestMatchers(HttpMethod.POST, "/evaluation").hasAuthority("SCOPE_USER")
                        .requestMatchers(HttpMethod.PUT, "/evaluation/{evaluationId}").hasAuthority("SCOPE_USER")
                        .requestMatchers(HttpMethod.DELETE, "/evaluation/{evaluationId}").hasAuthority("SCOPE_ADMIN")

                        .anyRequest().authenticated()
        );

        httpSecurity.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwtConfigurer -> jwtConfigurer.decoder(jwtDecoder())));

        httpSecurity.csrf(httpSecurityCsrfConfigurer ->
                httpSecurityCsrfConfigurer.disable());
        return httpSecurity.build();
    }

    @Bean
    JwtDecoder jwtDecoder(){
        SecretKeySpec secretKeySpec = new SecretKeySpec(SIGNER_KEY.getBytes(), "HS512");
        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        // Cấu hình CORS
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}