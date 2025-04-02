package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.Bill.BillCreationRequest;
import com.example.bookingStadium.dto.request.Bill.BillPaidRequest;
import com.example.bookingStadium.dto.request.Bill.BillUpdateRequest;
import com.example.bookingStadium.dto.response.BillResponse;
import com.example.bookingStadium.entity.Bill;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.entity.StadiumBookingDetail;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.BillMapper;
import com.example.bookingStadium.repository.BillRepository;
import com.example.bookingStadium.repository.BookingRepository;
import com.example.bookingStadium.repository.StadiumBookingDetailRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BillService {
    @Autowired
    private BillRepository billRepository;
    @Autowired
    private BillMapper billMapper;
    @Autowired
    private StadiumBookingDetailRepository stadiumBookingDetailRepository;
    @Autowired
    private BookingRepository bookingRepository;


    public Bill createBill(BillCreationRequest request){
       StadiumBookingDetail stadiumBookingDetail = stadiumBookingDetailRepository
               .findByBookingId(request.getStadiumBookingId());
       double price = stadiumBookingDetail.getPrice();

       Booking booking = bookingRepository.findById(request.getStadiumBookingId())
               .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_EXISTED));

       String userId = booking.getUserId();
       Bill bill = billMapper.toBill(request);
       bill.setFinalPrice(price);
       bill.setUserId(userId);
       return billRepository.save(bill);
    }

    public List<Bill> getBill(){
        return billRepository.findAll();
    }

    public BillResponse findBill(String billId){
        return billMapper.toBillResponse(billRepository.findById(billId)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_EXISTED)));
    }

    public BillResponse updateBill(String billId, BillUpdateRequest request){
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_EXISTED));

        String stadiumBookingId = bill.getStadiumBookingId();

        StadiumBookingDetail stadiumBookingDetail =
                stadiumBookingDetailRepository.findByBookingId(stadiumBookingId);

        double finalPrice = stadiumBookingDetail.getPrice();

        bill.setPaymentMethodId(request.getPaymentMethodId());
        bill.setFinalPrice(finalPrice);

        return billMapper.toBillResponse(billRepository.save(bill));
    }

    public BillResponse billPaid(String billId, BillPaidRequest request){
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_EXISTED));
        billMapper.paidBill(bill, request);
        return billMapper.toBillResponse(billRepository.save(bill));
    }

    public void deleteBill(String billId){
        billRepository.findById(billId).orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_EXISTED));
        billRepository.deleteById(billId);
    }

}
















