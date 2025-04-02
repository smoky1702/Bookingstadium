package com.example.bookingStadium.entity;


import com.example.bookingStadium.dto.request.Bill.BillStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "Bill")
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "bill_id")
    private String billId;

    @Column(name = "stadium_booking_id")
    private String stadiumBookingId;

    @Column(name = "payment_method_id")
    private int paymentMethodId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "final_price")
    private double finalPrice;

    @Column(name = "status")
    private BillStatus status = BillStatus.UNPAID;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @Column(name = "date_paid")
    private LocalDateTime datePaid;
}
