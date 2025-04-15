package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.Notification.NotificationCreationRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.entity.Notification;
import com.example.bookingStadium.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notification")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;

    ApiResponse<Notification> createNotification(@RequestBody @Valid NotificationCreationRequest request){
        return ApiResponse.<Notification>builder()
                .result(notificationService.createNotification(request))
                .message("Notification created and pushed via WebSocket!")
                .code(200)
                .build();
    }


}











