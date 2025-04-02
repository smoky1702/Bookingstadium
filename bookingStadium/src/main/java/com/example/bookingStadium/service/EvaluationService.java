package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.Evaluation.EvaluationCreationRequest;
import com.example.bookingStadium.dto.request.Evaluation.EvaluationUpdateRequest;
import com.example.bookingStadium.dto.response.EvaluationResponse;
import com.example.bookingStadium.entity.Evaluation;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.EvaluationMapper;
import com.example.bookingStadium.repository.EvaluationRepository;
import com.example.bookingStadium.repository.StadiumLocationRepository;
import com.example.bookingStadium.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EvaluationService {
    @Autowired
    private EvaluationRepository evaluationRepository;

    @Autowired
    private EvaluationMapper evaluationMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StadiumLocationRepository stadiumLocationRepository;

    public Evaluation createEvaluation(EvaluationCreationRequest request){
        if(!userRepository.existsById(request.getUserId())){
            System.out.println(request.getUserId());
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        if (!stadiumLocationRepository.existsById(request.getLocationId())) {
            throw new AppException(ErrorCode.STADIUM_LOCATION_NOT_EXISTED);
        }

        Evaluation evaluation = evaluationMapper.toEvaluation(request);
        return evaluationRepository.save(evaluation);
    }

    public List<Evaluation> getEvaluation(){
        return evaluationRepository.findAll();
    }

    public EvaluationResponse findEvaluation(String evaluationId){
        return evaluationMapper.toEvaluationResponse(evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new AppException(ErrorCode.EVALUATION_NOT_EXISTED)));
    }

    public EvaluationResponse updateEvaluation(String evaluationId, EvaluationUpdateRequest request){
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new AppException(ErrorCode.EVALUATION_NOT_EXISTED));
        evaluationMapper.updateEvaluation(evaluation, request);
        return evaluationMapper.toEvaluationResponse(evaluationRepository.save(evaluation));
    }

    public void deleteEvaluation(String evaluationId){
        evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new AppException(ErrorCode.EVALUATION_NOT_EXISTED));
        evaluationRepository.deleteById(evaluationId);
    }
}

















