package com.example.bookingStadium.controller;

import com.example.bookingStadium.dto.request.Chatbot.ChatbotRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.response.Chatbot.ChatbotResponse;
import com.example.bookingStadium.service.ChatbotService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {
    private static final Logger logger = LoggerFactory.getLogger(ChatbotController.class);
    
    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/query")
    public ApiResponse<ChatbotResponse> processQuery(@RequestBody @Valid ChatbotRequest request) {
        try {
            logger.info("Nhận yêu cầu chatbot: {}", request.getQuery());
            ChatbotResponse response = chatbotService.processQuery(request);
            logger.info("Phản hồi chatbot được gửi thành công");
            return new ApiResponse<>(response);
        } catch (Exception e) {
            logger.error("Lỗi xử lý yêu cầu chatbot: {}", e.getMessage(), e);
            return new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), 
                    "Có lỗi xảy ra khi xử lý yêu cầu: " + e.getMessage(), null);
        }
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleException(Exception e) {
        logger.error("Lỗi chung trong chatbot: {}", e.getMessage(), e);
        ApiResponse<String> response = new ApiResponse<>(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Lỗi hệ thống: " + e.getMessage(),
                null
        );
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 