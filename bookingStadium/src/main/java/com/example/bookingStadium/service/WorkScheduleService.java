package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.WorkSchedule.WorkScheduleCreationRequest;
import com.example.bookingStadium.dto.request.WorkSchedule.WorkScheduleUpdateRequest;
import com.example.bookingStadium.dto.response.WorkScheduleResponse;
import com.example.bookingStadium.entity.Work_Schedule;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.WorkScheduleMapper;
import com.example.bookingStadium.repository.WorkScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WorkScheduleService {
    @Autowired
    private WorkScheduleRepository workScheduleRepository;

    @Autowired
    private WorkScheduleMapper workScheduleMapper;

    public Work_Schedule createWorkSchedule(WorkScheduleCreationRequest request) {
        if (workScheduleRepository.existsByLocationId(request.getLocationId())) {
            throw new AppException(ErrorCode.WORK_SCHEDULE_EXISTED);
        }
        Work_Schedule workSchedule = workScheduleMapper.toWorkSchedule(request);
        return workScheduleRepository.save(workSchedule);
    }

    public List<Work_Schedule> getWorkSchedule(){
        return workScheduleRepository.findAll();
    }

    public WorkScheduleResponse findWorSchedule(String workScheduleId){
        return workScheduleMapper.toWorkScheduleResponse(workScheduleRepository.findById(workScheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SCHEDULE_NOT_EXISTED)));
    }

    public WorkScheduleResponse updateWorkSchedule(String workScheduleId, WorkScheduleUpdateRequest request){
        Work_Schedule workSchedule = workScheduleRepository.findById(workScheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SCHEDULE_NOT_EXISTED));
        workScheduleMapper.updateWorkSchedule(workSchedule, request);
        return workScheduleMapper.toWorkScheduleResponse(workScheduleRepository.save(workSchedule));
    }

    public void deleteWordSchedule(String workScheduleId){
         workScheduleRepository.findById(workScheduleId)
                .orElseThrow(() -> new AppException(ErrorCode.WORK_SCHEDULE_NOT_EXISTED));
         workScheduleRepository.deleteById(workScheduleId);
    }

}


















