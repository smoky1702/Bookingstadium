package com.example.bookingStadium.service;

import com.example.bookingStadium.dto.request.Users.UserCreationRequest;
import com.example.bookingStadium.dto.request.Users.UserUpdateRequest;
import com.example.bookingStadium.dto.request.Users.UserUpdateRoleRequest;
import com.example.bookingStadium.dto.response.Users.UserResponse;
import com.example.bookingStadium.entity.Roles;
import com.example.bookingStadium.entity.Users;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.UserMapper;
import com.example.bookingStadium.repository.RoleRepository;
import com.example.bookingStadium.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
@Slf4j
@Component
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private UserMapper userMapper;
    @Autowired
    private RoleRepository roleRepository;
    @Autowired
    private EmailService emailService;

    @Autowired
    private SecurityUtils securityUtils;


    public Users createUser(UserCreationRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles roles = roleRepository.findById("USER")
                .orElseThrow(()-> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        Users user = userMapper.toUser(request);
        user.setRole(roles);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        emailService.sendSimpleMessage(
                user.getEmail(),
                "Chào mừng bạn đến với hệ thống đặt sân!",
                "Cảm ơn bạn đã đăng ký. Hãy bắt đầu đặt sân ngay nào!"
        );

        return userRepository.save(user);
    }

    public Users createOwner(UserCreationRequest request){
        if(userRepository.existsByEmail(request.getEmail())){
            throw new AppException(ErrorCode.EMAIL_EXISTED);
        }

        Roles roles = roleRepository.findById("OWNER")
                .orElseThrow(()-> new AppException(ErrorCode.ROLE_NOT_EXISTED));

        Users user = userMapper.toUser(request);
        user.setRole(roles);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        emailService.sendSimpleMessage(
                user.getEmail(),
                "Chào mừng bạn đến với hệ thống đặt sân!",
                "Cảm ơn bạn đã đăng ký. Bây giờ bạn có thể quản lý sân của bạn trên hệ thống của chúng tôi!"
        );
        return userRepository.save(user);
    }


    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<Users> getUser(){
        log.info("In method get Users");
        return userRepository.findAll();
    }

    public UserResponse findUser(String id){
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        Users currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (!currentUser.getRole().getRoleId().equalsIgnoreCase("ADMIN")
                && !currentUser.getUser_id().equals(id)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED)));
    }


    public UserResponse updateUser(String user_Id, UserUpdateRequest request){
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        Users currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

        if (!currentUser.getUser_id().equals(user_Id)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }


        Users user = userRepository.findById(user_Id)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        userMapper.updateUser(user, request);
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public void deleteUser(String user_Id){
        userRepository.findById(user_Id)
                .orElseThrow(()-> new AppException(ErrorCode.USER_NOT_EXISTED));
        userRepository.deleteById(user_Id);
    }

    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public UserResponse updateRole(String userId, UserUpdateRoleRequest request){
        Users users = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));

        users.setRole(request.getRole());
        return userMapper.toUserResponse(userRepository.save(users));
    }

    public UserResponse findUserByEmail(String email) {
        Users user = userRepository.findByEmail(email)
            .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
        
        UserResponse response = userMapper.toUserResponse(user);
        response.setUser_id(user.getUser_id());
        
        return response;
    }
}
