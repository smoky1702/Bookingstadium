package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.Stadium.StadiumCreationRequest;
import com.example.bookingStadium.dto.request.Stadium.StadiumUpdateRequest;
import com.example.bookingStadium.dto.response.StadiumReponse;
import com.example.bookingStadium.entity.Stadium;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface StadiumMapper {
    Stadium toStadium(StadiumCreationRequest request);
    StadiumReponse toStadiumReponse(Stadium request);
    void updateStadium(@MappingTarget Stadium stadium, StadiumUpdateRequest request);
}
