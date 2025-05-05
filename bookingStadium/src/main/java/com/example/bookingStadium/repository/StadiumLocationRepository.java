package com.example.bookingStadium.repository;


import com.example.bookingStadium.entity.Stadium_Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StadiumLocationRepository extends JpaRepository<Stadium_Location, String> {
    boolean existsByLocationName(String locationName);
    void deleteByUserId(String userId);
}
