package com.example.bookingStadium.service;

import com.example.bookingStadium.config.MomoConfig;
import com.example.bookingStadium.dto.request.Bill.BillStatus;
import com.example.bookingStadium.entity.Bill;
import com.example.bookingStadium.repository.BillRepository;

import com.example.bookingStadium.util.MomoUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MomoPaymentService {
    @Autowired
    private final BillRepository billRepository;

    public String createMomoPayment(String billId) throws Exception {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        if (bill.getStatus() == BillStatus.PAID) {
            throw new RuntimeException("Bill already paid");
        }

        String orderId = billId; // sử dụng billId làm orderId để dễ truy xuất
        String requestId = UUID.randomUUID().toString();
        String amount = String.valueOf((long) bill.getFinalPrice());
        String orderInfo = "Thanh toán hóa đơn #" + billId;
        String extraData = "";

        String rawHash = "accessKey=" + MomoConfig.ACCESS_KEY +
                "&amount=" + amount +
                "&extraData=" + extraData +
                "&ipnUrl=" + MomoConfig.IPN_URL +
                "&orderId=" + orderId +
                "&orderInfo=" + orderInfo +
                "&partnerCode=" + MomoConfig.PARTNER_CODE +
                "&redirectUrl=" + MomoConfig.REDIRECT_URL +
                "&requestId=" + requestId +
                "&requestType=captureWallet";

        String signature = MomoUtil.hmacSHA256(MomoConfig.SECRET_KEY, rawHash);

        Map<String, Object> payload = new HashMap<>();
        payload.put("partnerCode", MomoConfig.PARTNER_CODE);
        payload.put("accessKey", MomoConfig.ACCESS_KEY);
        payload.put("requestId", requestId);
        payload.put("amount", amount);
        payload.put("orderId", orderId);
        payload.put("orderInfo", orderInfo);
        payload.put("redirectUrl", MomoConfig.REDIRECT_URL);
        payload.put("ipnUrl", MomoConfig.IPN_URL);
        payload.put("extraData", extraData);
        payload.put("requestType", "captureWallet");
        payload.put("signature", signature);
        payload.put("lang", "vi");

        // Gửi request tới MoMo
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);

        ResponseEntity<Map> momoResponse = restTemplate.postForEntity(MomoConfig.ENDPOINT, request, Map.class);

        Map<String, Object> responseBody = momoResponse.getBody();

        return (String) responseBody.get("payUrl");
    }

    public void handleMomoIPN(Map<String, Object> data) {
        String resultCode = data.get("resultCode").toString();
        String orderId = data.get("orderId").toString();
        String billId = orderId;

        if (!"0".equals(resultCode)) return;

        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new RuntimeException("Bill not found"));

        bill.setStatus(BillStatus.PAID);
        bill.setDatePaid(LocalDateTime.now());

        billRepository.save(bill);
    }
}
