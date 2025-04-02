package com.example.bookingStadium.entity;

import com.example.bookingStadium.dto.request.Booking.BookingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "Stadium_Booking")
@Getter
@Setter
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "stadium_booking_id")
    private String bookingId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "location_id")
    private String locationId;

    @Column(name = "date_of_booking")
    private LocalDate dateOfBooking;

    @Column(name = "start_time")
    private Time startTime;

    @Column(name = "end_time")
    private Time endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

}










