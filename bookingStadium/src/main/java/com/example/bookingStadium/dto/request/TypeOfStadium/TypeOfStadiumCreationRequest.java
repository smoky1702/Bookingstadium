package com.example.bookingStadium.dto.request.TypeOfStadium;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class TypeOfStadiumCreationRequest {
    @JsonProperty("type_name")
    private String typeName;
}
