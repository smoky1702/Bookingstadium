package com.example.bookingStadium.controller;

import com.example.bookingStadium.dto.request.Detail.StadiumBookingDetailRequest;
import com.example.bookingStadium.dto.response.Detail.StadiumBookingDetailResponse;
import com.example.bookingStadium.service.StadiumBookingDetailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booking-details")
public class StadiumBookingDetailController {
    @Autowired
    private StadiumBookingDetailService stadiumBookingDetailService;

    @PostMapping
    public StadiumBookingDetailResponse createBookingDetail(@RequestBody StadiumBookingDetailRequest request) {
        return stadiumBookingDetailService.createBookingDetail(request);
    }

    @GetMapping
    public List<StadiumBookingDetailResponse> getAllBookingDetails() {
        return stadiumBookingDetailService.getAllBookingDetails();
    }

    @GetMapping("/{bookingId}/{stadiumId}/{typeId}")
    public StadiumBookingDetailResponse getBookingDetailById(@PathVariable String bookingId, @PathVariable String stadiumId, @PathVariable int typeId) {
        return stadiumBookingDetailService.getBookingDetailById(bookingId, stadiumId, typeId);
    }

    @GetMapping("/booking/{bookingId}")
    public List<StadiumBookingDetailResponse> getBookingDetailsByBookingId(@PathVariable String bookingId) {
        return stadiumBookingDetailService.getBookingDetailsByBookingId(bookingId);
    }

    @PutMapping("/{bookingId}/{stadiumId}/{typeId}")
    public ResponseEntity<StadiumBookingDetailResponse> updateBookingDetail(
            @PathVariable String bookingId,
            @PathVariable String stadiumId,
            @PathVariable int typeId,
            @RequestBody StadiumBookingDetailRequest request) {

        // Log thông tin đầu vào
        System.out.println("Updating Booking Detail: bookingId=" + bookingId + ", stadiumId=" + stadiumId + ", typeId=" + typeId);
        System.out.println("Request Body: " + request);

        // Gọi service để cập nhật thông tin
        StadiumBookingDetailResponse response = stadiumBookingDetailService.updateBookingDetail(bookingId, stadiumId, typeId, request);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @DeleteMapping("/{bookingId}/{stadiumId}/{typeId}")
    public ResponseEntity<Void> deleteBookingDetail(
            @PathVariable String bookingId,
            @PathVariable String stadiumId,
            @PathVariable int typeId) {

        // Log thông tin đầu vào
        System.out.println("Deleting Booking Detail: bookingId=" + bookingId + ", stadiumId=" + stadiumId + ", typeId=" + typeId);

        // Gọi service để xóa thông tin
        stadiumBookingDetailService.deleteBookingDetail(bookingId, stadiumId, typeId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT); // Trả về 204 No Content
    }
}