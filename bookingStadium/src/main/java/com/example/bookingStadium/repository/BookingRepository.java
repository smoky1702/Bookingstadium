package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking, String> {

}