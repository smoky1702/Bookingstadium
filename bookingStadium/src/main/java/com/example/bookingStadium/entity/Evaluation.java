package com.example.bookingStadium.entity;


import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@Table(name = "Evaluation")
public class Evaluation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "evaluation_id")
    private String evaluation_id;

    @Column(name = "user_id")
    private String userId;

    @Column(name = "stadium_id")
    private String stadiumId;

    @Column(name = "rating_score", precision = 2, scale = 1, nullable = false)
    private BigDecimal ratingScore;

    @Column(name = "comment")
    private String comment;

    @Column(name = "date_created")
    private LocalDate dateCreated = LocalDate.now();
}
