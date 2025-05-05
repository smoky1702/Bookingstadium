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
public class StadiumLocationResponse {
    @JsonProperty("user_id")
    private String userId;

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

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;
}
