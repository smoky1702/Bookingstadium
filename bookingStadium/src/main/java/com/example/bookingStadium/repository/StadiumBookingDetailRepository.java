package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.StadiumBookingDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StadiumBookingDetailRepository extends JpaRepository<StadiumBookingDetail, Long> {
    List<StadiumBookingDetail> findByBookingId(String bookingId);
    Optional<StadiumBookingDetail> findByBookingIdAndStadiumIdAndTypeId(String bookingId, String stadiumId, int typeId);
    void deleteByBookingIdAndStadiumIdAndTypeId(String bookingId, String stadiumId, int typeId);
}