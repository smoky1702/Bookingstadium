package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.PaymentMethod.PaymentMethodCreationRequest;
import com.example.bookingStadium.dto.request.PaymentMethod.PaymentMethodUpdateRequest;
import com.example.bookingStadium.entity.Payment_Method;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.repository.PaymentMethodRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentMethodService {
    @Autowired
    private PaymentMethodRepository paymentMethodRepository;


    public Payment_Method createPaymentMethod(PaymentMethodCreationRequest request){
        if(paymentMethodRepository.existsByPaymentMethodName(request.getPaymentMethodName())){
            throw new AppException(ErrorCode.PAYMENT_METHOD_EXISTED);
        }

        Payment_Method paymentMethod = new Payment_Method();
        paymentMethod.setPaymentMethodName(request.getPaymentMethodName());
        return paymentMethodRepository.save(paymentMethod);
    }

    public List<Payment_Method> getPaymentMethod(){
        return paymentMethodRepository.findAll();
    }

    public Payment_Method findPaymentMethod(int paymentMethodId){
        return paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_EXISTED));
    }

    public Payment_Method updatePaymentMethod(int paymentMethodId, PaymentMethodUpdateRequest request){
        Payment_Method paymentMethod = paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_EXISTED));
        paymentMethod.setPaymentMethodName(request.getPaymentMethodName());
        return paymentMethodRepository.save(paymentMethod);
    }

    public void deletePaymentMethod(int paymentMethodId){
        paymentMethodRepository.findById(paymentMethodId)
                .orElseThrow(() -> new AppException(ErrorCode.PAYMENT_METHOD_NOT_EXISTED));
        paymentMethodRepository.deleteById(paymentMethodId);
    }

}
