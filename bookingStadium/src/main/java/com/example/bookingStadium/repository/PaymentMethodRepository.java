package com.example.bookingStadium.repository;


import com.example.bookingStadium.entity.Payment_Method;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentMethodRepository extends JpaRepository<Payment_Method, Integer> {
    boolean existsByPaymentMethodName(String name);
}
