package com.example.bookingStadium.entity;


import com.example.bookingStadium.dto.request.Stadium.StadiumStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

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
    @Column(name = "status")
    private StadiumStatus status = StadiumStatus.AVAILABLE;

    @Column(name = "date_created")
    private LocalDate dateCreated;

    @Column(name = "description")
    private String description;

}
