package com.example.bookingStadium.dto.request.WorkSchedule;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.sql.Time;
import java.util.Set;

@Data
public class WorkScheduleCreationRequest {

    @JsonProperty("location_id")
    private String locationId;

    @JsonProperty("day_of_the_week")
    private Set<DayOfTheWeek> dayOfTheWeek;

    @JsonProperty("opening_hours")
    private Time openingHours;

    @JsonProperty("closing_hours")
    private Time closingHours;
}
