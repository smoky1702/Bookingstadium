package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.Evaluation.EvaluationCreationRequest;
import com.example.bookingStadium.dto.request.Evaluation.EvaluationUpdateRequest;
import com.example.bookingStadium.dto.response.EvaluationResponse;
import com.example.bookingStadium.entity.Evaluation;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EvaluationMapper {
    Evaluation toEvaluation(EvaluationCreationRequest request);
    EvaluationResponse toEvaluationResponse(Evaluation evaluation);
    void updateEvaluation(@MappingTarget Evaluation evaluation, EvaluationUpdateRequest request);
}
