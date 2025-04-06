package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.Users.UserCreationRequest;
import com.example.bookingStadium.dto.request.Users.UserUpdateRequest;
import com.example.bookingStadium.dto.response.Users.UserResponse;
import com.example.bookingStadium.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    Users toUser (UserCreationRequest request);

    @Mapping(source = "role.roleId", target = "role_id") // Đảm bảo ánh xạ đúng
    UserResponse toUserResponse(Users user);

    void updateUser(@MappingTarget Users user, UserUpdateRequest request);
}

