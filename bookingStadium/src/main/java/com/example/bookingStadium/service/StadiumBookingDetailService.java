package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.Detail.StadiumBookingDetailCreationRequest;
import com.example.bookingStadium.dto.request.Detail.StadiumBookingDetailUpdateRequest;
import com.example.bookingStadium.dto.response.StadiumBookingDetailResponse;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.entity.Stadium;
import com.example.bookingStadium.entity.StadiumBookingDetail;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.StadiumBookingDetailMapper;
import com.example.bookingStadium.repository.BookingRepository;
import com.example.bookingStadium.repository.StadiumBookingDetailRepository;
import com.example.bookingStadium.repository.StadiumRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.sql.Time;
import java.time.Duration;
import java.time.LocalTime;
import java.util.List;


@Service
@RequiredArgsConstructor
public class StadiumBookingDetailService {
    @Autowired
    private StadiumBookingDetailRepository stadiumBookingDetailRepository;

    @Autowired
    private StadiumBookingDetailMapper stadiumBookingDetailMapper;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private StadiumRepository stadiumRepository;


    public StadiumBookingDetail createStadiumBookingDetail(StadiumBookingDetailCreationRequest request) {

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_EXISTED));

        double totalHours = calculateTotalHours(booking.getStartTime(), booking.getEndTime());

        Stadium stadium = stadiumRepository.findById(request.getStadiumId())
                .orElseThrow(() -> new AppException(ErrorCode.STADIUM_NOT_EXISTED));

        // Lấy giá tiền sân từ stadiumId
        double stadiumPrice = stadium.getPrice();

        // Tính tổng tiền thuê sân
        double totalPrice = calculateTotalPrice(stadiumPrice, totalHours);

        StadiumBookingDetail stadiumBookingDetail = stadiumBookingDetailMapper.toStadiumBookingDetails(request);
        stadiumBookingDetail.setBookingId(request.getBookingId());
        stadiumBookingDetail.setTotalHours(totalHours);
        stadiumBookingDetail.setPrice(totalPrice);

        return stadiumBookingDetailRepository.save(stadiumBookingDetail);
    }

    public List<StadiumBookingDetail> getStadiumBookingDetail(){
        return stadiumBookingDetailRepository.findAll();
    }

    public StadiumBookingDetailResponse findStadiumBookingDetail(String stadiumBookingDetailId){
        return stadiumBookingDetailMapper
                .toStadiumBookingDetailResponse(stadiumBookingDetailRepository
                        .findById(stadiumBookingDetailId)
                        .orElseThrow(()-> new AppException(ErrorCode.BOOKING_DETAIL_NOT_EXISTED)));
    }

    public StadiumBookingDetailResponse updateStadiumBookingDetail(String stadiumBookingDetailId
            , StadiumBookingDetailUpdateRequest request){
        StadiumBookingDetail stadiumBookingDetail = stadiumBookingDetailRepository.findById(stadiumBookingDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_DETAIL_NOT_EXISTED));

        String bookingId = stadiumBookingDetail.getBookingId();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_EXISTED));

        double totalHours = calculateTotalHours(booking.getStartTime(), booking.getEndTime());

        Stadium stadium = stadiumRepository.findById(request.getStadiumId())
                .orElseThrow(() -> new AppException(ErrorCode.STADIUM_NOT_EXISTED));

        double totalPrice = calculateTotalPrice(totalHours, stadium.getPrice());

        stadiumBookingDetailMapper.updateStadiumBookingDetail(stadiumBookingDetail, request);
        stadiumBookingDetail.setTotalHours(totalHours);
        stadiumBookingDetail.setPrice(totalPrice);

        return stadiumBookingDetailMapper
                .toStadiumBookingDetailResponse(stadiumBookingDetailRepository.save(stadiumBookingDetail));
    }

    public void deleteStadiumBookingDetail(String stadiumBookingDetailId){
        stadiumBookingDetailRepository.findById(stadiumBookingDetailId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_DETAIL_NOT_EXISTED));
        stadiumBookingDetailRepository.deleteById(stadiumBookingDetailId);
    }


    public double calculateTotalHours(Time startTime, Time endTime){
        if (startTime == null || endTime == null) {
            return 0.0;
        }

        LocalTime start = startTime.toLocalTime();
        LocalTime end = endTime.toLocalTime();

        double totalMinutes = Duration.between(start, end).toMinutes(); // Lấy tổng số phút
        return totalMinutes / 60; // Chuyển đổi thành giờ
    }

    public double calculateTotalPrice(double stadiumPrice, double totalHours) {
        if (stadiumPrice == 0  || totalHours <= 0) {
            return 0;
        }
        return stadiumPrice * totalHours;
    }

    public StadiumBookingDetailResponse findByBookingId(String bookingId) {
        try {
            StadiumBookingDetail detail = stadiumBookingDetailRepository.findByBookingId(bookingId);
            if (detail == null) {
                throw new AppException(ErrorCode.BOOKING_DETAIL_NOT_EXISTED);
            }
            return stadiumBookingDetailMapper.toStadiumBookingDetailResponse(detail);
        } catch (Exception e) {
            throw new AppException(ErrorCode.BOOKING_DETAIL_NOT_EXISTED);
        }
    }
}















