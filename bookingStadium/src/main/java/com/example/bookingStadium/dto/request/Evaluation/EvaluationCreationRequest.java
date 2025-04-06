package com.example.bookingStadium.dto.request.Evaluation;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class EvaluationCreationRequest {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("stadium_id")
    private String stadiumId;

    @JsonProperty("rating_score")
    private BigDecimal ratingScore;

    @JsonProperty("comment")
    private String comment;
}
