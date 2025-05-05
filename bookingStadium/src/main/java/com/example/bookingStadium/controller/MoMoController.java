package com.example.bookingStadium.controller;


import com.example.bookingStadium.service.MomoPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/momo")
@RequiredArgsConstructor
public class MoMoController {
    @Autowired
    private MomoPaymentService momoPaymentService;

    @PostMapping("/bill/{billId}")
    public ResponseEntity<?> createPayment(@PathVariable String billId) throws Exception {
        String payUrl = momoPaymentService.createMomoPayment(billId);
        return ResponseEntity.ok(Map.of("payUrl", payUrl));
    }

    @PostMapping("/ipn")
    public ResponseEntity<?> receiveIPN(@RequestBody Map<String, Object> payload) {
        momoPaymentService.handleMomoIPN(payload);
        return ResponseEntity.ok().build();
    }
}
