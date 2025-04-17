package com.example.bookingStadium.dto.request.Booking;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.sql.Time;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingUpdateRequest {
    @JsonProperty("date_of_booking")
    private Date dateOfBooking;

    @JsonProperty("start_time")
    private Time startTime;

    @JsonProperty("end_time")
    private Time endTime;

    @JsonProperty("status")
    private BookingStatus status;
}
