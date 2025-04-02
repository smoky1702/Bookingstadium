package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.WorkSchedule.WorkScheduleCreationRequest;
import com.example.bookingStadium.dto.request.WorkSchedule.WorkScheduleUpdateRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.response.WorkScheduleResponse;
import com.example.bookingStadium.entity.Work_Schedule;
import com.example.bookingStadium.service.WorkScheduleService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/WorkSchedule")
public class WorkScheduleController {
    @Autowired
    private WorkScheduleService workScheduleService;

    @PostMapping
    ApiResponse<Work_Schedule> createWorkSchedule(@RequestBody @Valid WorkScheduleCreationRequest request){
        ApiResponse<Work_Schedule> apiResponse = new ApiResponse<>();
        apiResponse.setResult(workScheduleService.createWorkSchedule(request));
        return apiResponse;
    }

    @GetMapping
    ApiResponse<List<Work_Schedule>> getWorkSchedule(){
        List<Work_Schedule> workSchedules = workScheduleService.getWorkSchedule();
        ApiResponse<List<Work_Schedule>> apiResponse = new ApiResponse<>(workSchedules);
        return apiResponse;
    }

    @GetMapping("/{workScheduleId}")
    ApiResponse<WorkScheduleResponse> findWorkSchedule(@PathVariable("workScheduleId") String workScheduleId){
        ApiResponse<WorkScheduleResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(workScheduleService.findWorSchedule(workScheduleId));
        return apiResponse;
    }

    @PutMapping("/{workScheduleId}")
    ApiResponse<WorkScheduleResponse> updateWorkSchedule(@PathVariable("workScheduleId") String workScheduleId
            ,@RequestBody WorkScheduleUpdateRequest request){
        ApiResponse<WorkScheduleResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(workScheduleService.updateWorkSchedule(workScheduleId, request));
        return apiResponse;
    }

    @DeleteMapping("/{workScheduleId}")
    ApiResponse<String> deleteWorkSchedule(@PathVariable("workScheduleId") String workScheduleId){
        workScheduleService.deleteWordSchedule(workScheduleId);
        return ApiResponse.<String>builder()
                .result("Work schedule has been deleted")
                .build();
    }
}
