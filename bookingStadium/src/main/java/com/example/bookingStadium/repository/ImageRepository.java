package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ImageRepository extends JpaRepository<Image, String> {
}
