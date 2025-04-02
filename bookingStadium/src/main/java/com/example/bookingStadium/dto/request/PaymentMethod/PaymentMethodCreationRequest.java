package com.example.bookingStadium.dto.request.PaymentMethod;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PaymentMethodCreationRequest {
    @JsonProperty("payment_method_name")
    private String paymentMethodName;
}
