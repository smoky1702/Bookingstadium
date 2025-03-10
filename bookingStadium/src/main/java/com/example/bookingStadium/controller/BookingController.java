package com.example.bookingStadium.controller;

import com.example.bookingStadium.dto.request.Booking.BookingRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.response.Booking.BookingResponse;
import com.example.bookingStadium.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/booking")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> bookStadium(@RequestBody BookingRequest request) {
        BookingResponse bookingResponse = bookingService.bookStadium(request);
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>(bookingResponse);
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED); // Trả về mã trạng thái 201 Created
    }
}