package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.Users.UserUpdateRoleRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.request.Users.UserCreationRequest;
import com.example.bookingStadium.dto.request.Users.UserUpdateRequest;
import com.example.bookingStadium.dto.response.Users.UserResponse;
import com.example.bookingStadium.entity.Users;
import com.example.bookingStadium.service.UserService;
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

    @PostMapping
    ApiResponse<Users> createUser(@RequestBody @Valid UserCreationRequest request){
        ApiResponse<Users> apiResponse = new ApiResponse<>();
        apiResponse.setResult(userService.createUser(request));
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
}
















