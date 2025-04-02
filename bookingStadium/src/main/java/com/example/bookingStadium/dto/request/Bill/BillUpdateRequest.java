package com.example.bookingStadium.dto.request.Bill;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillUpdateRequest {
    @JsonProperty("payment_method_id")
    private int paymentMethodId;
}
