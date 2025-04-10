package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, String> {
    List<Booking> findByDateOfBookingAndLocationId(LocalDate dateOfBooking, String locationId);
}