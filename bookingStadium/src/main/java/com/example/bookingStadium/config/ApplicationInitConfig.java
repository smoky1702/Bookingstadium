//package com.example.bookingStadium.config;
//
//
//import com.example.bookingStadium.dto.request.Users.UserCreationRequest;
//import com.example.bookingStadium.entity.Users;
//import com.example.bookingStadium.repository.UserRepository;
//import jakarta.persistence.GeneratedValue;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.beans.factory.annotation.Configurable;
//import org.springframework.boot.ApplicationRunner;
//import org.springframework.context.annotation.Bean;
//
//import javax.annotation.processing.Generated;
//import java.util.Random;
//
//@Configurable
//public class ApplicationInitConfig {
//    @Autowired
//    private UserRepository repository;
//    @Autowired
//    private UserCreationRequest userCreationRequest;
//
//    @Bean
//    ApplicationRunner applicationRunner(UserRepository userRepository){
//        return args ->{
//            if(userRepository.findByEmail("admin@example.com").isEmpty()){
//                Users user = new Users();
//                user.setEmail("admin@example.com");
//                user.setUser_id();
//            }
//        };
//    }
//}
