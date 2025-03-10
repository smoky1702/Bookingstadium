package com.example.bookingStadium.entity;

import com.example.bookingStadium.dto.request.Stadium.BookingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;

@Entity
@Table(name = "Stadium_Booking")
@Getter
@Setter
public class Booking {
    @Id
    @Column(name = "stadium_booking_id")
    private String bookingId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "date_of_booking")
    private Date dateOfBooking;

    @Column(name = "start_time")
    private Time startTime;

    @Column(name = "end_time")
    private Time endTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "number_of_bookings")
    private int numberOfBookings;

    @Column(name = "date_created")
    private Timestamp dateCreated;
}