package com.example.bookingStadium.dto.response.StadiumLocation;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StadiumLocationResponse {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("location_name")
    private String locationName;

    @JsonProperty( "address")
    private String address;

    @JsonProperty("city")
    private String city;

    @JsonProperty("district")
    private String district;
}
