package com.example.bookingStadium.dto.request.Booking;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.sql.Date;
import java.sql.Time;

@Data
public class BookingCreationRequest {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("location_id")
    private String locationId;

    @JsonProperty("date_of_booking")
    private Date dateOfBooking;

    @JsonProperty("start_time")
    private Time startTime;

    @JsonProperty("end_time")
    private Time endTime;

}