package com.example.bookingStadium.dto.request.Chatbot;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatbotRequest {
    @NotBlank(message = "Câu hỏi không được để trống")
    @JsonProperty("query")
    private String query;
    
    @JsonProperty("user_id")
    private String userId;
    
    @JsonProperty("conversation_context")
    private List<String> conversationContext;
    
    @JsonProperty("last_topic")
    private String lastTopic;
} 