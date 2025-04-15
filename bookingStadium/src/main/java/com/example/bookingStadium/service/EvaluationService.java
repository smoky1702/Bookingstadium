package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.Evaluation.EvaluationCreationRequest;
import com.example.bookingStadium.dto.request.Evaluation.EvaluationUpdateRequest;
import com.example.bookingStadium.dto.response.EvaluationResponse;
import com.example.bookingStadium.entity.Evaluation;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.EvaluationMapper;
import com.example.bookingStadium.repository.EvaluationRepository;
import com.example.bookingStadium.repository.StadiumRepository;
import com.example.bookingStadium.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
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
    private StadiumRepository stadiumRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @PreAuthorize("hasAuthority('SCOPE_USER')")
    public Evaluation createEvaluation(EvaluationCreationRequest request){
        if(!userRepository.existsById(request.getUserId())){
            System.out.println(request.getUserId());
            throw new AppException(ErrorCode.USER_NOT_EXISTED);
        }

        if (!stadiumRepository.existsById(request.getStadiumId())) {
            throw new AppException(ErrorCode.STADIUM_NOT_EXISTED);
        }
        
        // Đảm bảo người dùng chỉ có thể tạo đánh giá cho chính mình
        if (!securityUtils.isCurrentUser(request.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
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

    @PreAuthorize("hasAuthority('SCOPE_USER')")
    public EvaluationResponse updateEvaluation(String evaluationId, EvaluationUpdateRequest request){
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new AppException(ErrorCode.EVALUATION_NOT_EXISTED));
        
        // Kiểm tra người dùng hiện tại có phải là người tạo đánh giá không
        if (!securityUtils.isAdmin() && !securityUtils.isCurrentUser(evaluation.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        evaluationMapper.updateEvaluation(evaluation, request);
        return evaluationMapper.toEvaluationResponse(evaluationRepository.save(evaluation));
    }

    @PreAuthorize("hasAuthority('SCOPE_USER')")
    public void deleteEvaluation(String evaluationId){
        Evaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new AppException(ErrorCode.EVALUATION_NOT_EXISTED));
        
        // Kiểm tra người dùng hiện tại có phải là người tạo đánh giá không
        if (!securityUtils.isAdmin() && !securityUtils.isCurrentUser(evaluation.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        evaluationRepository.deleteById(evaluationId);
    }
}

















