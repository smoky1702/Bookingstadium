package com.example.bookingStadium.dto.request.Stadium;


import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;



@Data
public class StadiumUpdateRequest {

    @JsonProperty("type_id")
    private int typeId;

    @JsonProperty("stadium_name")
    private String stadiumName;

    @JsonProperty("price")
    private double price;

    @JsonProperty("status")
    @Enumerated(EnumType.STRING)
    private StadiumStatus status = StadiumStatus.INACTIVE;

    @JsonProperty("description")
    private String description;
}
