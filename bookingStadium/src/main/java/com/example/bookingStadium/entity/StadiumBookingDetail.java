package com.example.bookingStadium.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "Stadium_Booking_Details")
public class StadiumBookingDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "stadium_booking_Details_id")
    private String bookingDetailsId;

    @Column(name = "stadium_booking_id")
    private String bookingId;

    @Column(name = "type_id")
    private int typeId;

    @Column(name = "stadium_id")
    private String stadiumId;

    @Column(name = "total_hours")
    private double totalHours;

    @Column(name = "price")
    private Double price;
}