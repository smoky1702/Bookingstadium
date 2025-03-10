package com.example.bookingStadium.service;


import com.example.bookingStadium.dto.request.Stadium.StadiumCreationRequest;
import com.example.bookingStadium.entity.Stadium;
import com.example.bookingStadium.mapper.StadiumMapper;
import com.example.bookingStadium.repository.StadiumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StadiumService {
    @Autowired
    private StadiumRepository stadiumRepository;
    @Autowired
    private StadiumMapper stadiumMapper;

    public Stadium createStadium(StadiumCreationRequest request){
        Stadium stadium = stadiumMapper.toStadium(request);
        return stadiumRepository.save(stadium);
    }
}
