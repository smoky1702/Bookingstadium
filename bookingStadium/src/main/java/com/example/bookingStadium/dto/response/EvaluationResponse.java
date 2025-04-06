package com.example.bookingStadium.dto.response;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationResponse {
    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("stadium_id")
    private String stadiumIds;

    @JsonProperty("rating_score")
    private BigDecimal ratingScore;

    @JsonProperty("comment")
    private String comment;
}
