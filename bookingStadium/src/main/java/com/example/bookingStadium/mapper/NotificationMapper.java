package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.Notification.NotificationCreationRequest;
import com.example.bookingStadium.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    Notification toNotification(NotificationCreationRequest request);
}
