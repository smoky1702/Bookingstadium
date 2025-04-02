package com.example.bookingStadium.dto.request.Users;


import com.example.bookingStadium.entity.Roles;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreationRequest {
    @Email(message = "EMAIL_INVALID")
    private String email;
    private String firstname;
    private String lastname;
    @Size(min = 6, message = "PASSWORD_INVALID")
    private String password;
    private String phone;
    private LocalDate day_of_birth;
    private LocalDate date_created = LocalDate.now();
//    private LocalDate date_updated;
}
