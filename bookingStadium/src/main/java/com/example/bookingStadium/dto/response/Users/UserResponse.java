package com.example.bookingStadium.dto.response.Users;


import com.example.bookingStadium.entity.Roles;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private String role_id;
    private String email;
    private String firstname;
    private String lastname;
    private String phone;
    private LocalDate day_of_birth;
    private LocalDate date_created;
    private String user_id;

    public String getUser_id() {
        return user_id;
    }

    public void setUser_id(String user_id) {
        this.user_id = user_id;
    }
}
