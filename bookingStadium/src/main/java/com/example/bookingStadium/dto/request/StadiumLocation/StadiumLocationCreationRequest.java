package com.example.bookingStadium.dto.request.StadiumLocation;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class StadiumLocationCreationRequest {
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
