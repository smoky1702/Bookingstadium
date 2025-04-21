package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Bill;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BillRepository extends JpaRepository<Bill, String> {
    java.util.List<Bill> findByUserId(String userId);
}
