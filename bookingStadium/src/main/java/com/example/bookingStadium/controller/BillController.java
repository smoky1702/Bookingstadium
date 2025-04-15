package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.Bill.BillCreationRequest;
import com.example.bookingStadium.dto.request.Bill.BillPaidRequest;
import com.example.bookingStadium.dto.request.Bill.BillUpdateRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.response.BillResponse;
import com.example.bookingStadium.entity.Bill;
import com.example.bookingStadium.service.BillService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/bill")
public class BillController {
    @Autowired
    private BillService billService;

    @PostMapping
    ApiResponse<Bill> createBill(@RequestBody @Valid BillCreationRequest request){
        ApiResponse<Bill> apiResponse = new ApiResponse<>();
        apiResponse.setResult(billService.createBill(request));
        return apiResponse;
    }

    @PostMapping("/user")
    ApiResponse<Bill> createUserBill(@RequestBody @Valid BillCreationRequest request){
        ApiResponse<Bill> apiResponse = new ApiResponse<>();
        apiResponse.setResult(billService.createBill(request));
        return apiResponse;
    }

    @PostMapping("/owner")
    ApiResponse<Bill> createOwnerBill(@RequestBody @Valid BillCreationRequest request){
        ApiResponse<Bill> apiResponse = new ApiResponse<>();
        apiResponse.setResult(billService.createBill(request));
        return apiResponse;
    }

    @GetMapping
    ApiResponse<List<Bill>> getBill(){
        List<Bill> billList = billService.getBill();
        ApiResponse<List<Bill>> apiResponse = new ApiResponse<>(billList);
        return apiResponse;
    }

    @GetMapping("/{billId}")
    ApiResponse<BillResponse> findBill(@PathVariable("billId") String billId){
        ApiResponse<BillResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(billService.findBill(billId));
        return apiResponse;
    }

    @PutMapping("/update/{billId}")
    ApiResponse<BillResponse> updateBill(@PathVariable("billId") String billId, BillUpdateRequest request){
        ApiResponse<BillResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(billService.updateBill(billId, request));
        return apiResponse;
    }

    @PutMapping("/paid/{billId}")
    ApiResponse<BillResponse> paidBill(@PathVariable("billId") String billId, BillPaidRequest request){
        ApiResponse<BillResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(billService.billPaid(billId, request));
        return apiResponse;
    }

    @DeleteMapping("/{billId}")
    ApiResponse<String> deleteBill(@PathVariable("billId") String billId){
        billService.deleteBill(billId);
        return ApiResponse.<String>builder()
                .code(200)
                .result("Bill has been deleted")
                .build();
    }
}









