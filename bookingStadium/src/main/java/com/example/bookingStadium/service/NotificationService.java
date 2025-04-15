package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.Notification.NotificationCreationRequest;
import com.example.bookingStadium.entity.Notification;
import com.example.bookingStadium.mapper.NotificationMapper;
import com.example.bookingStadium.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {
    @Autowired
    private NotificationRepository notificationRepository;
    @Autowired
    private NotificationMapper notificationMapper;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(NotificationCreationRequest request){
        Notification notification = notificationMapper.toNotification(request);
        Notification savedNotification = notificationRepository.save(notification);

        //Gửi WebSocket đến đúng người dùng
        String destination = "/topic/notifications/" + request.getUserId();
        messagingTemplate.convertAndSend(destination, savedNotification);

        return savedNotification;
    }


}






















