package com.example.bookingStadium.dto.request.Notification;


import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class NotificationCreationRequest {

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("content")
    private String content;

    @JsonProperty("reference_id")
    private String referenceId;

    @JsonProperty("reference_type")
    private String referenceType;

}
