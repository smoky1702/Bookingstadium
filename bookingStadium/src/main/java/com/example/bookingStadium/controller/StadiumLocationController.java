package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.request.StadiumLocation.StadiumLocationCreationRequest;
import com.example.bookingStadium.dto.request.StadiumLocation.StadiumLocationUpdateRequest;
import com.example.bookingStadium.dto.response.StadiumLocationResponse;
import com.example.bookingStadium.entity.Stadium_Location;
import com.example.bookingStadium.service.StadiumLocationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/location")
public class  StadiumLocationController {
    @Autowired
    private StadiumLocationService stadiumLocationService;


    @PostMapping
    ApiResponse<Stadium_Location> createLocation(@RequestBody @Valid StadiumLocationCreationRequest request){
        ApiResponse<Stadium_Location> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumLocationService.createLocation(request));
        return apiResponse;
    }

    @GetMapping
    ApiResponse<List<Stadium_Location>> getLocation(){
        List<Stadium_Location> stadiumLocations = stadiumLocationService.getLocation();
        ApiResponse<List<Stadium_Location>> apiResponse = new ApiResponse<>(stadiumLocations);
        return apiResponse;
    }

    @GetMapping("/{locationId}")
    ApiResponse<StadiumLocationResponse> findLocation(@PathVariable String locationId){
        ApiResponse<StadiumLocationResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumLocationService.findLocation(locationId));
        return apiResponse;
    }

    @PutMapping("/{locationId}")
    ApiResponse<StadiumLocationResponse> updateLocation(@PathVariable("locationId") String locationId
            , @RequestBody StadiumLocationUpdateRequest request){
        ApiResponse<StadiumLocationResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumLocationService.updateLocation(locationId, request));
        return apiResponse;
    }

    @DeleteMapping("/{locationId}")
    public String deleteLocation(@PathVariable String locationId){
        stadiumLocationService.deleteLocation(locationId);
        return "Stadium location has been deleted";
    }
}













