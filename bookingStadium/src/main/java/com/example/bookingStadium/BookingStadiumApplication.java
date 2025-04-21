package com.example.bookingStadium;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BookingStadiumApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookingStadiumApplication.class, args);
	}

}
