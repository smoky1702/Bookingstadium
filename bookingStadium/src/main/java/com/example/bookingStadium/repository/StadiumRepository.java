package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Stadium;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StadiumRepository extends JpaRepository<Stadium, String> {
}
