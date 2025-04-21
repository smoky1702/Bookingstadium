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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private StadiumBookingMapper stadiumBookingMapper;
    
    @Autowired
    private SecurityUtils securityUtils;

    public Booking createBooking(BookingCreationRequest request){
        Booking booking = stadiumBookingMapper.toBooking(request);
        
        // Đảm bảo userId của booking là người dùng hiện tại
        booking.setUserId(securityUtils.getCurrentUserId());
        Time startTime = booking.getStartTime();
        LocalDate date = booking.getDateOfBooking();
        // Chuyển java.sql.Time thành LocalTime
        LocalTime time = startTime.toLocalTime();
        // Gộp lại thành LocalDateTime
        LocalDateTime dateTime = LocalDateTime.of(date, time);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH'h' 'ngày' dd/MM");
        String formatted = dateTime.format(formatter);

        return bookingRepository.save(booking);
    }

    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN')")
    public List<Booking> getBooking(){
        return bookingRepository.findAll();
    }

    public BookingResponse findBooking(String bookingId){
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(()-> new AppException(ErrorCode.BOOKING_NOT_EXISTED));
        
        // Chỉ cho phép người tạo booking hoặc admin xem chi tiết booking
        if (!securityUtils.isAdmin() && !securityUtils.isCurrentUser(booking.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        return stadiumBookingMapper.toBookingMapper(booking);
    }

    public BookingResponse updateBooking(String bookingId, BookingUpdateRequest request){
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_EXISTED));
        
        // Chỉ cho phép người tạo booking hoặc admin cập nhật booking
        if (!securityUtils.isAdmin() && !securityUtils.isCurrentUser(booking.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        stadiumBookingMapper.updateBooking(booking, request);
        if (request.getStatus() != null) {
            booking.setStatus(request.getStatus());
        }
        return stadiumBookingMapper.toBookingMapper(bookingRepository.save(booking));
    }

    public void deleteBooking(String bookingId){
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_EXISTED));
        
        // Chỉ cho phép người tạo booking hoặc admin xóa booking
        if (!securityUtils.isAdmin() && !securityUtils.isCurrentUser(booking.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
        
        bookingRepository.deleteById(bookingId);
    }
    /**
     * Lấy danh sách đặt sân user cụ thể
     */
    public List<BookingResponse> getUserBookings(String userId) {
        // admin hoặc chính người dùng đó mới có quyền xem
        if (!securityUtils.isAdmin() && !securityUtils.isCurrentUser(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        // Lấy danh sách booking theo userId
        List<Booking> bookings = bookingRepository.findByUserId(userId);

        // Chuyển đổi sang DTO response
        return bookings.stream()
                .map(stadiumBookingMapper::toBookingMapper)
                .toList();
    }
}








