package com.example.bookingStadium.dto.request.Stadium;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDate;

@Data
public class StadiumCreationRequest {
    @JsonProperty("location_id")
    private String locationId;

    @JsonProperty("type_id")
    private int typeId;

    @JsonProperty("stadium_name")
    private String stadiumName;

    @JsonProperty("price")
    private double price;

    @JsonProperty("status")
    private StadiumStatus status = StadiumStatus.AVAILABLE;

    @JsonProperty("date_created")
    private LocalDate dateCreated = LocalDate.now();

    @JsonProperty("description")
    private String description;

}
