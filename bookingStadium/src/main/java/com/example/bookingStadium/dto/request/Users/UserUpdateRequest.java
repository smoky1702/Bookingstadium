package com.example.bookingStadium.dto.request.Users;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRequest {
    private String firstname;
    private String lastname;
    @Size(min = 6, message = "PASSWORD_INVALID")
    private String password;
    private String phone;
    private LocalDate day_of_birth;
}
