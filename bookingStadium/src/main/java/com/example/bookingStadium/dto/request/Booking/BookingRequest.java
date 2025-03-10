package com.example.bookingStadium.dto.request.Booking;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.sql.Date;
import java.sql.Time;

@Data
public class BookingRequest {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("date_of_booking")
    private Date dateOfBooking;

    @JsonProperty("start_time")
    private Time startTime;

    @JsonProperty("end_time")
    private Time endTime;

    @JsonProperty("number_of_bookings")
    private int numberOfBookings;
}