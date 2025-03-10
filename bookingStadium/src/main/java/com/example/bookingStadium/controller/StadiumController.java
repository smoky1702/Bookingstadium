package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.Stadium.StadiumCreationRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.entity.Stadium;
import com.example.bookingStadium.service.StadiumService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
