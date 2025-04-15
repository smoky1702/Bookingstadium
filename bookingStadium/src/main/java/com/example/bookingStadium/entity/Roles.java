package com.example.bookingStadium.entity;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Roles")
public class Roles {
    @Id
    @Column(name = "role_id")
    private String roleId;
}
