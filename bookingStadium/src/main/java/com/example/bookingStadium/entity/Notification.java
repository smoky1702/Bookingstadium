package com.example.bookingStadium.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@Table(name = "Notification")
public class Notification {
    @Column(name = "notification_id")
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String notificationId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "content")
    private String content;

    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "reference_type")
    private String referenceType;

    @Column(name = "is_read")
    private boolean isRead = false;

    @Column(name = "date_created")
    private LocalDateTime dateCreated = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        this.dateCreated = LocalDateTime.now();
    }
}













