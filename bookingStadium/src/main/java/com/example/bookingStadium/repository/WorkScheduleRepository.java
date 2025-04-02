package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Work_Schedule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WorkScheduleRepository extends JpaRepository<Work_Schedule, String> {
    boolean existsByLocationId(String locationId);
}
