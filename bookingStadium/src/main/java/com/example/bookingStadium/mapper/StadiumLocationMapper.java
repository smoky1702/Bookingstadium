package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.StadiumLocation.StadiumLocationCreationRequest;
import com.example.bookingStadium.dto.request.StadiumLocation.StadiumLocationUpdateRequest;
import com.example.bookingStadium.dto.response.StadiumLocation.StadiumLocationResponse;
import com.example.bookingStadium.entity.Stadium_Location;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StadiumLocationMapper {
    Stadium_Location toStadiumLocation(StadiumLocationCreationRequest request);
    StadiumLocationResponse toStadiumResponse(Stadium_Location request);
    void updateStadiumLocation(@MappingTarget Stadium_Location stadiumLocation
            , StadiumLocationUpdateRequest request);
}
