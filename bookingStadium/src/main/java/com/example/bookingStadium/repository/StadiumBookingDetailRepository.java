package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.StadiumBookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;


public interface StadiumBookingDetailRepository extends JpaRepository<StadiumBookingDetail, String> {
    StadiumBookingDetail findByBookingId(String bookingId);
    List<StadiumBookingDetail> findByStadiumId(String stadiumId);
}