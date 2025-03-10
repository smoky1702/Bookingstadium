package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.StadiumLocation.StadiumLocationCreationRequest;
import com.example.bookingStadium.dto.request.StadiumLocation.StadiumLocationUpdateRequest;
import com.example.bookingStadium.dto.response.StadiumLocation.StadiumLocationResponse;
import com.example.bookingStadium.entity.Stadium_Location;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.StadiumLocationMapper;
import com.example.bookingStadium.repository.StadiumLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StadiumLocationService {
    @Autowired
    private StadiumLocationRepository stadiumLocationRepository;
    @Autowired
    private StadiumLocationMapper stadiumLocationMapper;

    public Stadium_Location createLocation(StadiumLocationCreationRequest request){
        if(stadiumLocationRepository.existsByLocationName(request.getLocationName())){
            throw new AppException(ErrorCode.STADIUM_LOCATION_EXISTED);
        }
        Stadium_Location stadiumLocation = stadiumLocationMapper.toStadiumLocation(request);
        return stadiumLocationRepository.save(stadiumLocation);
    }

    public List<Stadium_Location> getLocation(){
        return stadiumLocationRepository.findAll();
    }

    public StadiumLocationResponse findLocation(String locationId){
        return stadiumLocationMapper.toStadiumResponse(stadiumLocationRepository.findById(locationId)
                .orElseThrow(()-> new AppException(ErrorCode.STADIUM_LOCATION_NOT_EXISTED)));
    }

    public StadiumLocationResponse updateLocation(String locationId
            , StadiumLocationUpdateRequest request){
        Stadium_Location stadiumLocation = stadiumLocationRepository.findById(locationId).orElseThrow(()->
                        new AppException(ErrorCode.STADIUM_LOCATION_NOT_EXISTED));
        stadiumLocationMapper.updateStadiumLocation(stadiumLocation, request);
        return stadiumLocationMapper.toStadiumResponse(stadiumLocationRepository.save(stadiumLocation));
    }

    public void deleteLocation(String location_id){
        stadiumLocationRepository.deleteById(location_id);
    }
}
