package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.Stadium.StadiumCreationRequest;
import com.example.bookingStadium.dto.request.Stadium.StadiumUpdateRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.response.StadiumReponse;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.entity.Stadium;
import com.example.bookingStadium.service.StadiumService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
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
        List<Stadium> stadiumList = stadiumService.getStadium();
        ApiResponse<List<Stadium>> apiResponse = new ApiResponse<>(stadiumList);
        return apiResponse;
    }

    @GetMapping("/{stadiumId}")
    ApiResponse<StadiumReponse> findStadium(@PathVariable("stadiumId") String stadiumId){
        ApiResponse<StadiumReponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumService.findStadium(stadiumId));
        return apiResponse;
    }

    @GetMapping("/{stadiumId}/booking")
    ApiResponse<List<Booking>> getStadiumBooking(
            @PathVariable("stadiumId") String stadiumId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<Booking> bookings = stadiumService.getStadiumBooking(stadiumId, date);
        ApiResponse<List<Booking>> apiResponse = new ApiResponse<>(bookings);
        return apiResponse;
    }

    @PutMapping("/{stadiumId}")
    ApiResponse<StadiumReponse> updateStadium(@PathVariable("stadiumId") String stadiumId,
                                              @RequestBody StadiumUpdateRequest request){
        ApiResponse<StadiumReponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumService.updateStadium(stadiumId, request));
        return apiResponse;
    }

    @DeleteMapping("/{stadiumId}")
    public ApiResponse<String> deleteStadium(@PathVariable("stadiumId") String stadiumId){
        stadiumService.detele(stadiumId);
        return ApiResponse.<String>builder()
                .code(200)
                .result("Stadium has been deleted")
                .build();
    }
}









