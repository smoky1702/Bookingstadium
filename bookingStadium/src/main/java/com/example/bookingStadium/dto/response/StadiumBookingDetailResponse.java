package com.example.bookingStadium.dto.response;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StadiumBookingDetailResponse {
    @JsonProperty("stadium_booking_id")
    private String bookingId;

    @JsonProperty("type_id")
    private int typeId;

    @JsonProperty("stadium_id")
    private String stadiumId;

    @JsonProperty("total_hours")
    private double totalHours;

    @JsonProperty("price")
    private Double price;
}