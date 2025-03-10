package com.example.bookingStadium.dto.response;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse <T>{
    private int code = 200;
    private String message;
    private T result;

    //Sử dụng cho hàm get để lấy dữ liệu
    public ApiResponse(T result) {
        this.result = result;
        this.message = "Operation successful";
        this.code = 200;
    }
}
