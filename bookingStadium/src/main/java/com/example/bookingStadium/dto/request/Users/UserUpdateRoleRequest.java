package com.example.bookingStadium.dto.request.Users;



import com.example.bookingStadium.entity.Roles;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserUpdateRoleRequest {
    @JsonProperty("role_id")
    private Roles role;
}
