package com.example.bookingStadium.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.sql.Time;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
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