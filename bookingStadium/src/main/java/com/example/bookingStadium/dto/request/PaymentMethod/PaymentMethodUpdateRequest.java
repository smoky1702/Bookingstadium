package com.example.bookingStadium.dto.request.PaymentMethod;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentMethodUpdateRequest {
    @JsonProperty("payment_method_name")
    private String paymentMethodName;
}
