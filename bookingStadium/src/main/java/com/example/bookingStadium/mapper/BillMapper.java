package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.Bill.BillCreationRequest;
import com.example.bookingStadium.dto.request.Bill.BillPaidRequest;
import com.example.bookingStadium.dto.request.Bill.BillUpdateRequest;
import com.example.bookingStadium.dto.response.BillResponse;
import com.example.bookingStadium.dto.response.BookingResponse;
import com.example.bookingStadium.entity.Bill;
import com.example.bookingStadium.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface BillMapper {
    Bill toBill (BillCreationRequest request);
    BillResponse toBillResponse(Bill bill);
    void paidBill(@MappingTarget Bill bill, BillPaidRequest request);
}
