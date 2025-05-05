package com.example.bookingStadium.Security;

import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.entity.Users;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.repository.BookingRepository;
import com.example.bookingStadium.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {

    @Autowired
    private UserRepository userRepository;

    /**
     * Kiểm tra xem người dùng hiện tại có phải là người dùng có ID cụ thể không
     */
    public boolean isCurrentUser(String userId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        return currentUser.getUser_id().equals(userId);
    }

    /**
     * Kiểm tra xem người dùng hiện tại có quyền ADMIN không
     */
    public boolean isAdmin() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        return "ADMIN".equalsIgnoreCase(currentUser.getRole().getRoleId());
    }

    /**
     * Kiểm tra xem người dùng hiện tại có quyền OWNER không
     */
    public boolean isOwner() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        return "OWNER".equalsIgnoreCase(currentUser.getRole().getRoleId());
    }

    /**
     * Lấy ID của người dùng hiện tại
     */
    public String getCurrentUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));
        return currentUser.getUser_id();
    }

    /**
     * Người dùng có quyền nếu họ là chủ sở hữu tài nguyên hoặc là ADMIN
     */
    public boolean canAccessResource(String resourceOwnerId) {
        return isAdmin() || isCurrentUser(resourceOwnerId);
    }

    @Autowired
    private BookingRepository bookingRepository;
    public boolean isOwnerOfBooking(String bookingId) {
        // Nếu là admin, luôn cho phép
        if (isAdmin()) {
            return true;
        }

        // Tìm booking
        Booking booking = bookingRepository.findById(bookingId)
                .orElse(null);
        if (booking == null) {
            return false;
        }

        // Kiểm tra người dùng hiện tại có phải chủ sở hữu
        return isCurrentUser(booking.getUserId());
    }

    public boolean isOwnerOfBooking(Authentication authentication, String bookingId) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return isOwnerOfBooking(bookingId);
    }
} 