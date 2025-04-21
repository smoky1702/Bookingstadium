package com.example.bookingStadium.dto.response;


import com.example.bookingStadium.dto.request.Bill.BillStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BillResponse {
    @JsonProperty("bill_id")
    private String billId;

    @JsonProperty("stadium_booking_id")
    private String stadiumBookingId;

    @JsonProperty("payment_method_id")
    private int paymentMethodId;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("final_price")
    private double finalPrice;

    @JsonProperty("status")
    private BillStatus status = BillStatus.UNPAID;

    @JsonProperty("date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @JsonProperty("date_paid")
    private LocalDateTime datePaid;
}
