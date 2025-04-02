package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.WorkSchedule.WorkScheduleCreationRequest;
import com.example.bookingStadium.dto.request.WorkSchedule.WorkScheduleUpdateRequest;
import com.example.bookingStadium.dto.response.WorkScheduleResponse;
import com.example.bookingStadium.entity.Work_Schedule;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface WorkScheduleMapper {
    @Mapping(target = "dayOfTheWeek", source = "dayOfTheWeek")
    Work_Schedule toWorkSchedule(WorkScheduleCreationRequest request);
    WorkScheduleResponse toWorkScheduleResponse(Work_Schedule workSchedule);
    void updateWorkSchedule(@MappingTarget Work_Schedule workSchedule, WorkScheduleUpdateRequest request);
}
