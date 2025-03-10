package com.example.bookingStadium.service;

import com.example.bookingStadium.dto.request.Booking.BookingRequest;
import com.example.bookingStadium.dto.request.Stadium.BookingStatus;
import com.example.bookingStadium.dto.response.Booking.BookingResponse;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.dto.request.Stadium.StadiumStatus; // Đảm bảo import đúng enum
import com.example.bookingStadium.repository.BookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;

@Service
public class BookingService {
    @Autowired
    private BookingRepository bookingRepository;

    public BookingResponse bookStadium(BookingRequest request) {
        // Kiểm tra giá trị của dateOfBooking
        if (request.getDateOfBooking() == null) {
            throw new IllegalArgumentException("Date of booking cannot be null");
        }

        // Kiểm tra giá trị của startTime và endTime
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Start time and end time cannot be null");
        }

        // Kiểm tra rằng thời gian bắt đầu phải trước thời gian kết thúc
        if (request.getStartTime().after(request.getEndTime())) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        Booking booking = new Booking();
        booking.setBookingId(java.util.UUID.randomUUID().toString());
        booking.setUserId(request.getUserId());
        booking.setDateOfBooking(request.getDateOfBooking());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus(BookingStatus.PENDING);
        booking.setNumberOfBookings(request.getNumberOfBookings());
        booking.setDateCreated(new Timestamp(System.currentTimeMillis()));

        Booking savedBooking = bookingRepository.save(booking);

        return new BookingResponse(
                savedBooking.getBookingId(),
                savedBooking.getUserId(),
                savedBooking.getDateOfBooking(),
                savedBooking.getStartTime(),
                savedBooking.getEndTime(),
                savedBooking.getStatus().name(),
                savedBooking.getNumberOfBookings()
        );
    }
}