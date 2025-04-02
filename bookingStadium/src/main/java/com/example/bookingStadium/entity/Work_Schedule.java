package com.example.bookingStadium.entity;


import com.example.bookingStadium.dto.request.WorkSchedule.DayOfTheWeek;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.sql.Time;
import java.util.Set;

@Entity
@Table(name = "Work_Schedule")
@Getter
@Setter
public class Work_Schedule {
    @Column(name = "work_schedule_id")
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String workScheduleId;

    @Column(name = "location_id")
    private String locationId;

    @Enumerated(EnumType.STRING)
    @ElementCollection(targetClass = DayOfTheWeek.class, fetch = FetchType.EAGER)
    @CollectionTable(name = "work_schedule_days", joinColumns = @JoinColumn(name = "work_schedule_id"))
    @Column(name = "day_of_the_week")
    private Set<DayOfTheWeek> dayOfTheWeek;

    @Column(name = "opening_hours")
    private Time openingHours;

    @Column(name = "closing_hours")
    private Time closingHours;


}
