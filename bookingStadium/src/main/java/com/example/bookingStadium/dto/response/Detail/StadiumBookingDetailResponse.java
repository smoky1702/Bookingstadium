package com.example.bookingStadium.dto.response.Detail;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StadiumBookingDetailResponse {
    @JsonProperty("stadium_booking_id")
    private String bookingId;

    @JsonProperty("stadium_id")
    private String stadiumId;

    @JsonProperty("type_id")
    private int typeId;

    @JsonProperty("quantity")
    private int quantity;

    @JsonProperty("duration")
    private int duration;

    @JsonProperty("price")
    private BigDecimal price;
}