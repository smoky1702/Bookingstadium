package com.example.bookingStadium.mapper;

import com.example.bookingStadium.dto.request.Detail.StadiumBookingDetailCreationRequest;
import com.example.bookingStadium.dto.request.Detail.StadiumBookingDetailUpdateRequest;
import com.example.bookingStadium.dto.response.StadiumBookingDetailResponse;
import com.example.bookingStadium.entity.StadiumBookingDetail;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StadiumBookingDetailMapper {
    StadiumBookingDetail toStadiumBookingDetails(StadiumBookingDetailCreationRequest request);
    StadiumBookingDetailResponse toStadiumBookingDetailResponse(StadiumBookingDetail stadiumBookingDetail);
    void updateStadiumBookingDetail(@MappingTarget StadiumBookingDetail stadiumBookingDetail
            , StadiumBookingDetailUpdateRequest request);
}