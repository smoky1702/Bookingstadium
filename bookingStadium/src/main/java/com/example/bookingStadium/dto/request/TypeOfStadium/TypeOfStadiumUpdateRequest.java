package com.example.bookingStadium.dto.request.TypeOfStadium;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TypeOfStadiumUpdateRequest {
    @JsonProperty("type_name")
    private String typeName;
}
