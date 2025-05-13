package com.example.bookingStadium.repository;


import com.example.bookingStadium.entity.Stadium_Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StadiumLocationRepository extends JpaRepository<Stadium_Location, String> {
    boolean existsByLocationName(String locationName);
    void deleteByUserId(String userId);
    
    // Tìm tất cả location thuộc quyền sở hữu của owner theo user_id
    List<Stadium_Location> findByUserId(String userId);
}
