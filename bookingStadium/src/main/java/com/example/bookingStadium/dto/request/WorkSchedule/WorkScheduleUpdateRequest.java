package com.example.bookingStadium.dto.request.WorkSchedule;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Time;
import java.util.Set;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WorkScheduleUpdateRequest {


    @JsonProperty("day_of_the_week")
    private Set<DayOfTheWeek> dayOfTheWeek;

    @JsonProperty("opening_hours")
    private Time openingHours;

    @JsonProperty("closing_hours")
    private Time closingHours;
}
