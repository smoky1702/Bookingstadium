package com.example.bookingStadium.mapper;

import com.example.bookingStadium.dto.request.TypeOfStadium.TypeOfStadiumCreationRequest;
import com.example.bookingStadium.dto.request.TypeOfStadium.TypeOfStadiumUpdateRequest;
import com.example.bookingStadium.dto.response.TypeOfStadiumResponse;
import com.example.bookingStadium.entity.Type_Of_Stadium;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface TypeOfStadiumMapper {
    Type_Of_Stadium toType(TypeOfStadiumCreationRequest request);
    TypeOfStadiumResponse toTypeResponse(Type_Of_Stadium request);
    void updateType(@MappingTarget Type_Of_Stadium type, TypeOfStadiumUpdateRequest request);
}
