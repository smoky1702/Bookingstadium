package com.example.bookingStadium.dto.request.Detail;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class StadiumBookingDetailRequest {

    @JsonProperty("quantity")
    private int quantity;

    @JsonProperty("duration")
    private int duration;

    @JsonProperty("price")
    private BigDecimal price;
}