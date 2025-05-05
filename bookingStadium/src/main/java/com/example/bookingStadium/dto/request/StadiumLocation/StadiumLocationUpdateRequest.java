package com.example.bookingStadium.dto.request.StadiumLocation;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;


@Data
public class StadiumLocationUpdateRequest {
    @JsonProperty("location_name")
    private String locationName;

    @JsonProperty( "address")
    private String address;

    @JsonProperty("ward")
    private String ward;

    @JsonProperty("district")
    private String district;

    @JsonProperty("city")
    private String city;
}
