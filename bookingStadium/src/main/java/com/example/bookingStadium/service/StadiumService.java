package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.Stadium.StadiumCreationRequest;
import com.example.bookingStadium.dto.request.Stadium.StadiumUpdateRequest;
import com.example.bookingStadium.dto.response.StadiumReponse;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.entity.Stadium;
import com.example.bookingStadium.entity.StadiumBookingDetail;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.StadiumMapper;
import com.example.bookingStadium.repository.BookingRepository;
import com.example.bookingStadium.repository.StadiumBookingDetailRepository;
import com.example.bookingStadium.repository.StadiumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StadiumService {
    @Autowired
    private StadiumRepository stadiumRepository;
    @Autowired
    private StadiumMapper stadiumMapper;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private StadiumBookingDetailRepository stadiumBookingDetailRepository;

    public Stadium createStadium(StadiumCreationRequest request){
        Stadium stadium = stadiumMapper.toStadium(request);
        return stadiumRepository.save(stadium);
    }

    public List<Stadium> getStadium(){
        return stadiumRepository.findAll();
    }

    public StadiumReponse findStadium(String stadiumId){
        return stadiumMapper.toStadiumReponse(stadiumRepository.findById(stadiumId)
                .orElseThrow(()->new AppException(ErrorCode.STADIUM_NOT_EXISTED)));
    }

    public StadiumReponse updateStadium(String stadiumId, StadiumUpdateRequest request){
        Stadium stadium = stadiumRepository.findById(stadiumId)
                .orElseThrow(()-> new AppException(ErrorCode.STADIUM_NOT_EXISTED));
        stadiumMapper.updateStadium(stadium, request);
        return stadiumMapper.toStadiumReponse(stadiumRepository.save(stadium));
    }

    public void detele(String stadiumId){
        stadiumRepository.deleteById(stadiumId);
    }

    public List<Booking> getStadiumBooking(String stadiumId, LocalDate date) {
        // Kiểm tra sân có tồn tại không
        Stadium stadium = stadiumRepository.findById(stadiumId)
                .orElseThrow(() -> new AppException(ErrorCode.STADIUM_NOT_EXISTED));
                
        // Lấy locationId từ stadium
        String locationId = stadium.getLocationId();
        
        // trả danh sách booking theo locationId và date
        return bookingRepository.findByDateOfBookingAndLocationId(date, locationId);
    }
}
