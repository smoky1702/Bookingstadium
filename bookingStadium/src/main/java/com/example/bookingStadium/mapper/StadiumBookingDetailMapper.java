package com.example.bookingStadium.mapper;

import com.example.bookingStadium.dto.request.Detail.StadiumBookingDetailRequest;
import com.example.bookingStadium.dto.response.Detail.StadiumBookingDetailResponse;
import com.example.bookingStadium.entity.StadiumBookingDetail;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StadiumBookingDetailMapper {
    StadiumBookingDetail toEntity(StadiumBookingDetailRequest request);
    StadiumBookingDetailResponse toResponse(StadiumBookingDetail entity);
    void updateEntity(@MappingTarget StadiumBookingDetail entity, StadiumBookingDetailRequest request);
}