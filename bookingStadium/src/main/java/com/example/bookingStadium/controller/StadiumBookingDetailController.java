package com.example.bookingStadium.controller;

import com.example.bookingStadium.dto.request.Detail.StadiumBookingDetailCreationRequest;
import com.example.bookingStadium.dto.request.Detail.StadiumBookingDetailUpdateRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.response.StadiumBookingDetailResponse;
import com.example.bookingStadium.entity.StadiumBookingDetail;
import com.example.bookingStadium.service.StadiumBookingDetailService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/details")
public class StadiumBookingDetailController {
    @Autowired
    private StadiumBookingDetailService stadiumBookingDetailService;

    @PostMapping
    ApiResponse<StadiumBookingDetail> createBookingDetail
            (@RequestBody @Valid StadiumBookingDetailCreationRequest request){
        ApiResponse<StadiumBookingDetail> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumBookingDetailService.createStadiumBookingDetail(request));
        return apiResponse;
    }

    @GetMapping
    ApiResponse<List<StadiumBookingDetail>> getStadiumBookingDetail(){
        List<StadiumBookingDetail> stadiumBookingDetailList = stadiumBookingDetailService.getStadiumBookingDetail();
        ApiResponse<List<StadiumBookingDetail>> apiResponse = new ApiResponse<>(stadiumBookingDetailList);
        return apiResponse;
    }

    @GetMapping("/{stadiumBookingDetailId}")
    ApiResponse<StadiumBookingDetailResponse> findStadiumBookingDetail
            (@PathVariable("stadiumBookingDetailId") String stadiumBookingDetailId){
        ApiResponse<StadiumBookingDetailResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumBookingDetailService.findStadiumBookingDetail(stadiumBookingDetailId));
        return apiResponse;
    }

    @PutMapping("{stadiumBookingDetailId}")
    ApiResponse<StadiumBookingDetailResponse> updateStadiumBookingDetail
            (@PathVariable("stadiumBookingDetailId") String stadiumBookingDetailId
                    , @RequestBody StadiumBookingDetailUpdateRequest request){
        ApiResponse<StadiumBookingDetailResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumBookingDetailService.updateStadiumBookingDetail(stadiumBookingDetailId, request));
        return apiResponse;
    }

    @DeleteMapping("{stadiumBookingDetailId}")
    ApiResponse<String> deleteStadiumBookingDetailId
            (@PathVariable("stadiumBookingDetailId") String stadiumBookingDetailId){
        stadiumBookingDetailService.deleteStadiumBookingDetail(stadiumBookingDetailId);
        return ApiResponse.<String>builder()
                .code(200)
                .result("Stadium booking detail has been deleted")
                .build();
    }

    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("isAuthenticated() and @securityUtils.isOwnerOfBooking(authentication, #bookingId)")
    ApiResponse<StadiumBookingDetailResponse> findDetailByBookingId(@PathVariable("bookingId") String bookingId) {
        ApiResponse<StadiumBookingDetailResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(stadiumBookingDetailService.findByBookingId(bookingId));
        return apiResponse;
    }
}











