package com.example.bookingStadium.controller;

import com.example.bookingStadium.dto.request.Booking.BookingCreationRequest;
import com.example.bookingStadium.dto.request.Booking.BookingUpdateRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.response.Booking.BookingResponse;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking")
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @PostMapping
    ApiResponse<Booking> createBooking(@RequestBody @Valid BookingCreationRequest request){
        ApiResponse<Booking> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.createBooking(request));
        return apiResponse;
    }

    @GetMapping
    ApiResponse<List<Booking>> getBooking(){
        List<Booking> bookingList = bookingService.getBooking();
        ApiResponse<List<Booking>> apiResponse = new ApiResponse<>(bookingList);
        return apiResponse;
    }

    @GetMapping("/{bookingId}")
    ApiResponse<BookingResponse> findBooking(@PathVariable("bookingId") String bookingId){
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.findBooking(bookingId));
        return apiResponse;
    }

    @PutMapping("{bookingId}")
    ApiResponse<BookingResponse> updateBooking(@PathVariable("bookingId") String bookingId
            , @RequestBody BookingUpdateRequest request){
        ApiResponse<BookingResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookingService.updateBooking(bookingId, request));
        return apiResponse;
    }

    @DeleteMapping("{bookingId}")
    ApiResponse<String> deleteBooking(@PathVariable("bookingId") String bookingId){
        bookingService.deleteBooking(bookingId);
        return ApiResponse.<String>builder()
                .code(200)
                .result("Booking has been deleted")
                .build();
    }

}
























