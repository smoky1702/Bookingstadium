package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.PaymentMethod.PaymentMethodCreationRequest;
import com.example.bookingStadium.dto.request.PaymentMethod.PaymentMethodUpdateRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.entity.Payment_Method;
import com.example.bookingStadium.service.PaymentMethodService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/PaymentMethod")
public class PaymentMethodController {
    @Autowired
    private PaymentMethodService paymentMethodService;

    @PostMapping
    public ApiResponse<Payment_Method> createPaymentMethod
            (@RequestBody @Valid PaymentMethodCreationRequest request){
        ApiResponse<Payment_Method> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentMethodService.createPaymentMethod(request));
        return apiResponse;
    }

    @GetMapping
    public ApiResponse<List<Payment_Method>> getPaymentMethod(){
        List<Payment_Method> paymentMethod = paymentMethodService.getPaymentMethod();
        ApiResponse<List<Payment_Method>> apiResponse = new ApiResponse<>(paymentMethod);
        return apiResponse;
    }

    @GetMapping("/{paymentMethodId}")
    public ApiResponse<Payment_Method> findPaymentMethod(@PathVariable("paymentMethodId") int paymentMethodId){
        ApiResponse<Payment_Method> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentMethodService.findPaymentMethod(paymentMethodId));
        return apiResponse;
    }

    @PutMapping("/{paymentMethodId}")
    public ApiResponse<Payment_Method> updatePaymentMethod(@PathVariable("paymentMethodId") int paymentMethodId
            , @RequestBody PaymentMethodUpdateRequest request){
        ApiResponse<Payment_Method> apiResponse = new ApiResponse<>();
        apiResponse.setResult(paymentMethodService.updatePaymentMethod(paymentMethodId, request));
        return apiResponse;
    }

    @DeleteMapping("{paymentMethodId}")
    public ApiResponse<String> deletePaymentMethod(@PathVariable("paymentMethodId") int paymentMethodId){
        paymentMethodService.deletePaymentMethod(paymentMethodId);
        return ApiResponse.<String>builder()
                .result("Payment method has been deleted")
                .build();
    }
}

















