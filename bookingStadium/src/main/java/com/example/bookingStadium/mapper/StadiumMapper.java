package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.Stadium.StadiumCreationRequest;
import com.example.bookingStadium.entity.Stadium;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface StadiumMapper {
    Stadium toStadium(StadiumCreationRequest request);
}
