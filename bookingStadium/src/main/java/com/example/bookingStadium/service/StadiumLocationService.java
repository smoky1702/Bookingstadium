package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.StadiumLocation.StadiumLocationCreationRequest;
import com.example.bookingStadium.dto.request.StadiumLocation.StadiumLocationUpdateRequest;
import com.example.bookingStadium.dto.response.StadiumLocationResponse;
import com.example.bookingStadium.entity.Stadium_Location;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.StadiumLocationMapper;
import com.example.bookingStadium.repository.StadiumLocationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class StadiumLocationService {
    @Autowired
    private StadiumLocationRepository stadiumLocationRepository;
    @Autowired
    private StadiumLocationMapper stadiumLocationMapper;
    @Autowired
    private GoongMapService goongMapService;


    public Stadium_Location createLocation(StadiumLocationCreationRequest request){
        if(stadiumLocationRepository.existsByLocationName(request.getLocationName())){
            throw new AppException(ErrorCode.STADIUM_LOCATION_EXISTED);
        }

        // Ghép địa chỉ đầy đủ để gọi Goong API
        String fullAddress = String.format("%s, %s, %s, %s",
                request.getAddress(),
                request.getWard(),
                request.getDistrict(),
                request.getCity());

        log.info("Calling Goong API with address: {}", fullAddress);

        // Gọi Goong API để lấy tọa độ
        Optional<GoongMapService.LatLng> coordinates = goongMapService.getCoordinates(fullAddress);

        Stadium_Location stadiumLocation = stadiumLocationMapper.toStadiumLocation(request);
        stadiumLocation.setWard(request.getWard());

        // Nếu lấy được tọa độ, set vào entity
        coordinates.ifPresent(coord -> {
            stadiumLocation.setLatitude(coord.getLatitude());
            stadiumLocation.setLongitude(coord.getLongitude());
            log.debug("Coordinates found: lat={}, lng={}", coord.getLatitude(), coord.getLongitude());
        });
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
    
    /**
     * Tìm tất cả location thuộc quyền sở hữu của owner theo user_id
     */
    public List<Stadium_Location> findByUserId(String userId) {
        return stadiumLocationRepository.findByUserId(userId);
    }
}
