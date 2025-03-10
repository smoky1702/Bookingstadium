package com.example.bookingStadium.dto.response.Booking;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.sql.Time;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    @JsonProperty("stadium_booking_id")
    private String bookingId; // ID của booking

    @JsonProperty("user_id")
    private String userId; // ID của người dùng

    @JsonProperty("date_of_booking")
    private Date dateOfBooking; // Ngày đặt sân

    @JsonProperty("start_time")
    private Time startTime; // Thời gian bắt đầu

    @JsonProperty("end_time")
    private Time endTime; // Thời gian kết thúc

    @JsonProperty("status")
    private String status; // Trạng thái booking

    @JsonProperty("number_of_bookings")
    private int numberOfBookings; // Số lượng booking
}