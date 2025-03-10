package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.Users.UserCreationRequest;
import com.example.bookingStadium.dto.request.Users.UserUpdateRequest;
import com.example.bookingStadium.dto.response.Users.UserResponse;
import com.example.bookingStadium.entity.Users;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    Users toUser (UserCreationRequest request);
    UserResponse toUserResponse(Users user);
    void updateUser(@MappingTarget Users user, UserUpdateRequest request);
}

