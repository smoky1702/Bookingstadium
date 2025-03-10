package com.example.bookingStadium.dto.request.Users;



import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticationRequest {
    @Email(message = "EMAIL_INVALID")
    private String email;
    private String password;
}
