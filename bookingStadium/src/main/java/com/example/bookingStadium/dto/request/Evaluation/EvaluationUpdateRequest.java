package com.example.bookingStadium.dto.request.Evaluation;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluationUpdateRequest {

    @JsonProperty("rating_score")
    private BigDecimal ratingScore;

    @JsonProperty("comment")
    private String comment;
}
