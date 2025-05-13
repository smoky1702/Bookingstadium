package com.example.bookingStadium.entity;

import java.time.LocalDate;

import com.example.bookingStadium.dto.request.Stadium.StadiumStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Stadium {
    @Column(name = "stadium_id")
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String stadiumId;

    @Column(name = "location_id")
    private String locationId;

    @Column(name = "type_id")
    private int typeId;

    @Column(name = "stadium_name")
    private String stadiumName;

    @Column(name = "price")
    private double price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", columnDefinition = "ENUM('INACTIVE', 'AVAILABLE')")
    private StadiumStatus status = StadiumStatus.INACTIVE;

    @Column(name = "date_created")
    private LocalDate dateCreated;

    @Column(name = "description")
    private String description;

}
