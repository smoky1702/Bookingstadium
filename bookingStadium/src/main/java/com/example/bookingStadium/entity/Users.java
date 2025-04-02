package com.example.bookingStadium.entity;


import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;



@Entity
@Getter
@Setter
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String user_id;

    @ManyToOne(fetch = FetchType.EAGER) // Một user chỉ có MỘT role
    @JoinColumn(name = "role_id", nullable = false) // Trỏ đến role_id của bảng Roles
    private Roles role;

    @Email
    private String email;

    private String firstname;
    private String lastname;
    private String password;
    private String phone;
    private LocalDate day_of_birth;
    private LocalDate date_created;
    private LocalDate date_updated;

}
