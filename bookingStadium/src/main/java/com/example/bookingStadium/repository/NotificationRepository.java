package com.example.bookingStadium.repository;

import com.example.bookingStadium.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, String> {
}
