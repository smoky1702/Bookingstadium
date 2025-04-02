package com.example.bookingStadium.dto.response;


import com.example.bookingStadium.dto.request.Stadium.StadiumStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StadiumReponse {
    private String stadiumId;
    private String locationId;
    private int typeId;
    private String stadiumName;
    private double price;
    private StadiumStatus status = StadiumStatus.AVAILABLE;
    private LocalDate dateCreated;
    private String description;
}
