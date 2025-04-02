package com.example.bookingStadium.dto.request.Bill;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BillCreationRequest {
    @JsonProperty("stadium_booking_id")
    private String stadiumBookingId;

    @JsonProperty("payment_method_id")
    private int paymentMethodId;
}
