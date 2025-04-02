package com.example.bookingStadium.dto.response;


import com.example.bookingStadium.dto.request.WorkSchedule.DayOfTheWeek;
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
public class WorkScheduleResponse {
    private String locationId;
    private Set<DayOfTheWeek> dayOfTheWeek;
    private Time openingHours;
    private Time closingHours;
}
