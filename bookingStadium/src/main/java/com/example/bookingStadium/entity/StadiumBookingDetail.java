package com.example.bookingStadium.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@Table(name = "Stadium_Booking_Details")
@IdClass(StadiumBookingDetailId.class)
public class StadiumBookingDetail {
    @Id
    @Column(name = "stadium_booking_id")
    private String bookingId;

    @Id
    @Column(name = "stadium_id")
    private String stadiumId;

    @Id
    @Column(name = "type_id")
    private int typeId;

    @Column(name = "quantity")
    private int quantity;

    @Column(name = "duration")
    private int duration;

    @Column(name = "price")
    private BigDecimal price;
}