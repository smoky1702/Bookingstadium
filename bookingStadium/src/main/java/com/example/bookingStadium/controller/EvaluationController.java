package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.Evaluation.EvaluationCreationRequest;
import com.example.bookingStadium.dto.request.Evaluation.EvaluationUpdateRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.response.EvaluationResponse;
import com.example.bookingStadium.entity.Evaluation;
import com.example.bookingStadium.service.EvaluationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/evaluation")
public class EvaluationController {
    @Autowired
    private EvaluationService evaluationService;

    @PostMapping
    ApiResponse<Evaluation> createEvaluation(@RequestBody @Valid EvaluationCreationRequest request){
        ApiResponse<Evaluation> apiResponse = new ApiResponse<>();
        apiResponse.setResult(evaluationService.createEvaluation(request));
        return apiResponse;
    }

    @GetMapping
    ApiResponse<List<Evaluation>> getEvaluation(){
        List<Evaluation> evaluationList = evaluationService.getEvaluation();
        ApiResponse<List<Evaluation>> apiResponse = new ApiResponse<>(evaluationList);
        return apiResponse;
    }

    @GetMapping("/{evaluationId}")
    ApiResponse<EvaluationResponse> findEvaluation(@PathVariable("evaluationId") String evaluationId){
        ApiResponse<EvaluationResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(evaluationService.findEvaluation(evaluationId));
        return apiResponse;
    }

    @PutMapping("/{evaluationId}")
    ApiResponse<EvaluationResponse> updateEvaluation(@PathVariable("evaluationId") String evaluationId
            , @RequestBody EvaluationUpdateRequest request){
        ApiResponse<EvaluationResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(evaluationService.updateEvaluation(evaluationId, request));
        return apiResponse;
    }

    @DeleteMapping("/{evaluationId}")
    ApiResponse<String> deleteEvaluation(@PathVariable("evaluationId") String evaluationId){
        evaluationService.deleteEvaluation(evaluationId);
        return ApiResponse.<String>builder()
                .code(200)
                .result("Evaluation has been deleted")
                .build();
    }
}




















