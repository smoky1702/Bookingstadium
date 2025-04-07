package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImageRepository extends JpaRepository<Image, String> {
    List<Image> findByStadiumId(String stadiumId);
}
