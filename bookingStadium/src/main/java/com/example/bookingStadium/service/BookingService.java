package com.example.bookingStadium.service;

import com.example.bookingStadium.dto.request.Booking.BookingCreationRequest;
import com.example.bookingStadium.dto.request.Booking.BookingUpdateRequest;
import com.example.bookingStadium.dto.response.BookingResponse;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.StadiumBookingMapper;
import com.example.bookingStadium.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private StadiumBookingMapper stadiumBookingMapper;

    public Booking createBooking(BookingCreationRequest request){
        Booking booking = stadiumBookingMapper.toBooking(request);
        return bookingRepository.save(booking);
    }

    public List<Booking> getBooking(){
        return bookingRepository.findAll();
    }

    public BookingResponse findBooking(String bookingId){
        return stadiumBookingMapper.toBookingMapper(bookingRepository.findById(bookingId)
                .orElseThrow(()-> new AppException(ErrorCode.BOOKING_NOT_EXISTED)));
    }

    public BookingResponse updateBooking(String bookingId, BookingUpdateRequest request){
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_EXISTED));
        stadiumBookingMapper.updateBooking(booking, request);
        return stadiumBookingMapper.toBookingMapper(bookingRepository.save(booking));
    }

    public void deleteBooking(String bookingId){
        bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_EXISTED));
        bookingRepository.deleteById(bookingId);
    }
}








