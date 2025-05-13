package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Stadium;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface StadiumRepository extends JpaRepository<Stadium, String> {
    @Query("SELECT s.price FROM Stadium s WHERE s.stadiumId = :stadiumId")
    Optional<BigDecimal> findPriceByStadiumId(String stadiumId);
    
    // Tìm tất cả stadium theo locationId
    List<Stadium> findByLocationId(String locationId);
}
