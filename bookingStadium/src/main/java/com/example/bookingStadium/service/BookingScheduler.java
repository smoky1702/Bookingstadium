package com.example.bookingStadium.service;

import com.example.bookingStadium.dto.request.Booking.BookingStatus;
import com.example.bookingStadium.dto.request.Notification.NotificationCreationRequest;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.repository.BookingRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Lớp này chịu trách nhiệm tự động cập nhật trạng thái booking dựa trên thời gian
 */
@Component
@Slf4j
public class BookingScheduler {

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private NotificationService notificationService;

    /**
     * Cập nhật trạng thái booking:
     * 1. CONFIRMED -> COMPLETED: khi đã qua thời gian kết thúc
     * 2. PENDING -> CANCELLED: khi đã quá 15 phút từ thời gian bắt đầu
     * 
     * Chạy mỗi 5 phút
     */
    @Scheduled(fixedRate = 300000) // 5 phút = 300,000ms
    @Transactional
    public void updateBookingStatuses() {
        log.info("Đang chạy cập nhật tự động trạng thái booking...");
        
        // Lấy thời gian hiện tại
        LocalDateTime now = LocalDateTime.now();
        LocalDate currentDate = now.toLocalDate();
        LocalTime currentTime = now.toLocalTime();
        Time sqlCurrentTime = Time.valueOf(currentTime);
        
        log.info("Thời gian hiện tại: {}, ngày hiện tại: {}", now, currentDate);
        
        // 1. Cập nhật CONFIRMED -> COMPLETED
        updateCompletedBookings(currentDate, sqlCurrentTime);
        
        // 2. Cập nhật PENDING -> CANCELLED đối với các đơn quá hạn
        cancelExpiredPendingBookings(currentDate, now);
    }
    
    /**
     * Cập nhật các booking từ CONFIRMED sang COMPLETED
     */
    private void updateCompletedBookings(LocalDate currentDate, Time currentTime) {
        List<Booking> confirmedBookings = bookingRepository.findBookingsToComplete(
                BookingStatus.CONFIRMED, currentDate, currentTime);
        
        log.info("Tìm thấy {} booking cần chuyển sang COMPLETED", confirmedBookings.size());
        
        for (Booking booking : confirmedBookings) {
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
            
            // Gửi thông báo cho người dùng
            try {
                NotificationCreationRequest notification = new NotificationCreationRequest();
                notification.setUserId(booking.getUserId());
                notification.setContent("Đặt sân của bạn đã được đánh dấu là hoàn thành. Cảm ơn bạn đã sử dụng dịch vụ!");
                notification.setReferenceId(booking.getBookingId());
                notification.setReferenceType("BOOKING");
                
                notificationService.createNotification(notification);
            } catch (Exception e) {
                log.error("Không thể gửi thông báo hoàn thành cho booking {}: {}", 
                        booking.getBookingId(), e.getMessage());
            }
        }
    }
    
    /**
     * Hủy các booking PENDING đã quá hạn
     */
    private void cancelExpiredPendingBookings(LocalDate currentDate, LocalDateTime currentTimestamp) {
        // Lấy danh sách cả 2 loại booking quá hạn
        List<Booking> allExpiredBookings = new ArrayList<>();
        
        // 1. Booking từ các ngày quá khứ
        List<Booking> pastBookings = bookingRepository.findPastPendingBookings(
                BookingStatus.PENDING, currentDate);
        allExpiredBookings.addAll(pastBookings);
        
        // In chi tiết các booking quá khứ được tìm thấy
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        log.info("Thông tin chi tiết booking quá khứ đã tìm thấy ({}):", pastBookings.size());
        for (Booking booking : pastBookings) {
            log.info("   - Booking ID: {}, Ngày đặt: {}, StartTime: {}, EndTime: {}", 
                    booking.getBookingId(), 
                    booking.getDateOfBooking().format(dateFormatter),
                    booking.getStartTime(),
                    booking.getEndTime());
        }
        
        // 2. Booking từ ngày hiện tại đã quá 15 phút so với giờ bắt đầu
        List<Booking> delayedBookingsToday = bookingRepository.findDelayedPendingBookingsToday(
                BookingStatus.PENDING.toString(), currentDate, currentTimestamp);
        allExpiredBookings.addAll(delayedBookingsToday);
        
        log.info("Tìm thấy {} booking PENDING đã quá hạn cần hủy (quá khứ: {}, hôm nay: {})", 
                allExpiredBookings.size(), pastBookings.size(), delayedBookingsToday.size());
        
        for (Booking booking : allExpiredBookings) {
            log.info("Hủy booking: {}, ngày: {}, trạng thái trước khi hủy: {}", 
                    booking.getBookingId(), booking.getDateOfBooking(), booking.getStatus());
            
            booking.setStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            
            // Gửi thông báo cho người dùng
            try {
                NotificationCreationRequest notification = new NotificationCreationRequest();
                notification.setUserId(booking.getUserId());
                
                String reason = booking.getDateOfBooking().isBefore(currentDate) ? 
                        "ngày đặt sân đã qua" : 
                        "không xác nhận trong thời gian quy định (15 phút)";
                
                notification.setContent("Đặt sân của bạn đã tự động bị hủy do " + reason + ".");
                notification.setReferenceId(booking.getBookingId());
                notification.setReferenceType("BOOKING");
                
                notificationService.createNotification(notification);
            } catch (Exception e) {
                log.error("Không thể gửi thông báo hủy đặt sân cho booking {}: {}", 
                        booking.getBookingId(), e.getMessage());
            }
        }
    }
} 