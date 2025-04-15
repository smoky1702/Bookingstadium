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
import org.springframework.security.access.prepost.PreAuthorize;
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
    @Autowired
    private SecurityUtils securityUtils;

    public Bill createBill(BillCreationRequest request){
       StadiumBookingDetail stadiumBookingDetail = stadiumBookingDetailRepository
               .findByBookingId(request.getStadiumBookingId());
       double price = stadiumBookingDetail.getPrice();

       Booking booking = bookingRepository.findById(request.getStadiumBookingId())
               .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_EXISTED));

       String userId = booking.getUserId();
       
       // Kiểm tra người dùng hiện tại có phải là người tạo booking hoặc OWNER
       if (!securityUtils.isOwner() && !securityUtils.isCurrentUser(userId)) {
           throw new AppException(ErrorCode.FORBIDDEN);
       }
       
       Bill bill = billMapper.toBill(request);
       bill.setFinalPrice(price);
       bill.setUserId(userId);
       return billRepository.save(bill);
    }

    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN', 'SCOPE_OWNER')")
    public List<Bill> getBill(){
        return billRepository.findAll();
    }

    public BillResponse findBill(String billId){
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_EXISTED));
        
        // Chỉ cho phép người sở hữu bill, admin hoặc owner xem chi tiết bill
        if (!securityUtils.isAdmin() && !securityUtils.isOwner() 
                && !securityUtils.isCurrentUser(bill.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        return billMapper.toBillResponse(bill);
    }

    public BillResponse updateBill(String billId, BillUpdateRequest request){
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_EXISTED));

        // Chỉ cho phép chủ hóa đơn, admin hoặc owner cập nhật bill
        if (!securityUtils.isAdmin() && !securityUtils.isOwner() && !securityUtils.isCurrentUser(bill.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        String stadiumBookingId = bill.getStadiumBookingId();

        StadiumBookingDetail stadiumBookingDetail =
                stadiumBookingDetailRepository.findByBookingId(stadiumBookingId);

        double finalPrice = stadiumBookingDetail.getPrice();

        bill.setPaymentMethodId(request.getPaymentMethodId());
        bill.setFinalPrice(finalPrice);

        return billMapper.toBillResponse(billRepository.save(bill));
    }

    @PreAuthorize("hasAuthority('SCOPE_OWNER')")
    public BillResponse billPaid(String billId, BillPaidRequest request){
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_EXISTED));
        billMapper.paidBill(bill, request);
        return billMapper.toBillResponse(billRepository.save(bill));
    }

    public void deleteBill(String billId){
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException(ErrorCode.BILL_NOT_EXISTED));
                
        // Chỉ cho phép admin hoặc owner xóa bill
        if (!securityUtils.isAdmin() && !securityUtils.isOwner()) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        billRepository.deleteById(billId);
    }
}
















