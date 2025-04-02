package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.Stadium.StadiumCreationRequest;
import com.example.bookingStadium.dto.request.Stadium.StadiumUpdateRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.response.StadiumReponse;
import com.example.bookingStadium.entity.Stadium;
import com.example.bookingStadium.service.StadiumService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/stadium")
public class StadiumController {
    @Autowired
    private StadiumService stadiumService;


    @PostMapping
    ApiResponse<Stadium> createStadium(@RequestBody @Valid StadiumCreationRequest request){
        ApiResponse<Stadium> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumService.createStadium(request));
        return apiResponse;
    }

    @GetMapping
    ApiResponse<List<Stadium>> getStadium(){
        ApiResponse<List<Stadium>> apiResponse = new ApiResponse<>();
        return apiResponse;
    }

    @GetMapping("/{stadiumId}")
    ApiResponse<StadiumReponse> findStadium(@PathVariable("stadiumId") String stadiumId){
        ApiResponse<StadiumReponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumService.findStadium(stadiumId));
        return apiResponse;
    }

    @PutMapping("/{stadiumId}")
    ApiResponse<StadiumReponse> updateStadium(@PathVariable("/{stadiumId}") String stadiumId,
                                              @RequestBody StadiumUpdateRequest request){
        ApiResponse<StadiumReponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumService.updateStadium(stadiumId, request));
        return apiResponse;
    }

    @DeleteMapping("/{stadiumId}")
    public String deleteStadium(@PathVariable("/{stadiumId}") String stadiumId){
        stadiumService.detele(stadiumId);
        return "Stadium has been deleted";
    }
}









