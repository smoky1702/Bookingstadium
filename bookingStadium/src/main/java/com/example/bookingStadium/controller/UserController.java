package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.Users.UserUpdateRoleRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.request.Users.UserCreationRequest;
import com.example.bookingStadium.dto.request.Users.UserUpdateRequest;
import com.example.bookingStadium.dto.response.Users.UserResponse;
import com.example.bookingStadium.entity.Users;
import com.example.bookingStadium.service.UserService;
import com.example.bookingStadium.dto.response.BillResponse;
import com.example.bookingStadium.dto.response.BookingResponse;
import com.example.bookingStadium.service.BillService;
import com.example.bookingStadium.service.BookingService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/users")
public class UserController {
    @Autowired
    private UserService userService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private BillService billService;

    @PostMapping
    ApiResponse<Users> createUser(@RequestBody @Valid UserCreationRequest request){
        ApiResponse<Users> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.createUser(request));
        return apiResponse;
    }

    @PostMapping("/owner")
    ApiResponse<Users> createOwner(@RequestBody @Valid UserCreationRequest request){
        ApiResponse<Users> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.createOwner(request));
        return apiResponse;
    }

    @GetMapping
    ApiResponse<List<Users>> getUsers() {

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Email: {}", authentication.getName());
        log.info("Role: {}", authentication.getAuthorities());

        List<Users> user = userService.getUser();
        ApiResponse<List<Users>> apiResponse = new ApiResponse<>(user);
        return apiResponse;
    }

    @GetMapping("/{userId}")
    ApiResponse<UserResponse> findUser(@PathVariable("userId") String userId){
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.findUser(userId));
        return apiResponse;
    }

    @GetMapping("/me")
    ApiResponse<UserResponse> getCurrentUser() {
        // Lấy thông tin của người dùng hiện tại từ SecurityContext
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        log.info("Getting current user info for email: {}", email);
        
        // Tìm user theo email
        UserResponse user = userService.findUserByEmail(email);
        
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(user);
        return apiResponse;
    }

    @PutMapping("/{userId}")
    ApiResponse<UserResponse> updateUser(@PathVariable("userId") String userId
            , @RequestBody UserUpdateRequest request){
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.updateUser(userId, request));
        return apiResponse;
    }

    @DeleteMapping("/{userId}")
    ApiResponse<String> deleteUser(@PathVariable String userId){
        userService.deleteUser(userId);
        return ApiResponse.<String>builder()
                .result("User has been deleted")
                .build();
    }

    @PutMapping("/role/{userId}")
    ApiResponse<UserResponse> updateRole(@PathVariable("userId") String userId
            , @RequestBody UserUpdateRoleRequest request){
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.updateRole(userId, request));
        return apiResponse;
    }
    /**
     * Lấy danh sách đặt sân của người dùng
     */
    @GetMapping("/{userId}/bookings")
    ApiResponse<List<BookingResponse>> getUserBookings(@PathVariable("userId") String userId) {
        List<BookingResponse> bookings = bookingService.getUserBookings(userId);
        ApiResponse<List<BookingResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookings);
        return apiResponse;
    }

    /**
     * Lấy danh sách hóa đơn của người dùng
     */
    @GetMapping("/{userId}/bills")
    ApiResponse<List<BillResponse>> getUserBills(@PathVariable("userId") String userId) {
        List<BillResponse> bills = billService.getUserBills(userId);
        ApiResponse<List<BillResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bills);
        return apiResponse;
    }

    /**
     * Lấy danh sách đặt sân của người dùng hiện tại
     */
    @GetMapping("/me/bookings")
    ApiResponse<List<BookingResponse>> getCurrentUserBookings() {
        // Lấy thông tin của người dùng hiện tại từ SecurityContext
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Tìm user theo email
        UserResponse user = userService.findUserByEmail(email);

        // Lấy danh sách booking
        List<BookingResponse> bookings = bookingService.getUserBookings(user.getUser_id());

        ApiResponse<List<BookingResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bookings);
        return apiResponse;
    }

    /**
     * Lấy danh sách hóa đơn của người dùng hiện tại
     */
    @GetMapping("/me/bills")
    ApiResponse<List<BillResponse>> getCurrentUserBills() {
        // Lấy thông tin của người dùng hiện tại từ SecurityContext
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        // Tìm user theo email
        UserResponse user = userService.findUserByEmail(email);

        // Lấy danh sách bill
        List<BillResponse> bills = billService.getUserBills(user.getUser_id());

        ApiResponse<List<BillResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(bills);
        return apiResponse;
    }
}
















