package com.example.bookingStadium.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Type_Of_Stadium {
    @Column(name = "type_id")
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int typeId;
    @Column(name = "type_name")
    private String typeName;
}
