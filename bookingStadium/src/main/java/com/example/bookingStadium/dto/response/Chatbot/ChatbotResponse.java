package com.example.bookingStadium.dto.response.Chatbot;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotResponse {
    @JsonProperty("answer")
    private String answer;
    
    @JsonProperty("source_type")
    private String sourceType;
    
    @JsonProperty("source_id")
    private String sourceId;
} 