package com.example.bookingStadium.dto.request.Detail;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StadiumBookingDetailUpdateRequest {
    @JsonProperty("type_id")
    private int typeId;

    @JsonProperty("stadium_id")
    private String stadiumId;
}
