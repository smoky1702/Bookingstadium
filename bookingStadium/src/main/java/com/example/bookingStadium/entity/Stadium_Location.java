package com.example.bookingStadium.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Stadium_Location {
    @Column(name = "location_id")
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String locationId;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "location_name")
    private String locationName;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "district")
    private String district;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "latitude")
    private Double latitude;
}
