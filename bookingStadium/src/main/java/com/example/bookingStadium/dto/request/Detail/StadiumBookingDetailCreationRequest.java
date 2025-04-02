package com.example.bookingStadium.dto.request.Detail;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;


@Data
public class StadiumBookingDetailCreationRequest {

    @JsonProperty("stadium_booking_id")
    private String bookingId;

    @JsonProperty("type_id")
    private int typeId;

    @JsonProperty("stadium_id")
    private String stadiumId;
}