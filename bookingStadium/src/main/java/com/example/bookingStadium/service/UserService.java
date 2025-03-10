package com.example.bookingStadium.service;

import com.example.bookingStadium.dto.request.Users.UserCreationRequest;
import com.example.bookingStadium.dto.request.Users.UserUpdateRequest;
import com.example.bookingStadium.dto.response.Users.UserResponse;
import com.example.bookingStadium.entity.Roles;
import com.example.bookingStadium.entity.Users;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.UserMapper;
import com.example.bookingStadium.repository.RoleRepository;
import com.example.bookingStadium.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RoleRepository roleRepository;

    public Users createUser(UserCreationRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles roles = roleRepository.findById(3)
                .orElseThrow(()-> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        Users user = userMapper.toUser(request);
        user.setRole(roles);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return userRepository.save(user);
    }

    public List<Users> getUser(){
        return userRepository.findAll();
    }

    public UserResponse findUser(String id){
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }

    public UserResponse updateUser(String user_Id, UserUpdateRequest request){
        Users user = userRepository.findById(user_Id)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.updateUser(user, request);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public void deleteUser(String user_Id){
        Users user = userRepository.findById(user_Id)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        userRepository.deleteById(user_Id);
    }
}
