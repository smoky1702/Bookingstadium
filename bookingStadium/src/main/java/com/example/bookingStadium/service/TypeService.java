package com.example.bookingStadium.service;



import com.example.bookingStadium.dto.request.TypeOfStadium.TypeOfStadiumCreationRequest;
import com.example.bookingStadium.dto.request.TypeOfStadium.TypeOfStadiumUpdateRequest;
import com.example.bookingStadium.dto.response.TypeOfLocation.TypeOfStadiumResponse;
import com.example.bookingStadium.entity.Type_Of_Stadium;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.TypeOfStadiumMapper;
import com.example.bookingStadium.repository.TypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TypeService {
    @Autowired
    private TypeRepository typeRepository;
    @Autowired
    private TypeOfStadiumMapper typeOfStadiumMapper;

    public Type_Of_Stadium createType(TypeOfStadiumCreationRequest request){
//        Type_Of_Stadium typeOfStadium = new Type_Of_Stadium();
        if(typeRepository.existsByTypeName(request.getTypeName())){
            throw new AppException(ErrorCode.TYPE_OF_STADIUM_EXISTED);
        }
//        typeOfStadium.setTypeName(request.getTypeName());
        Type_Of_Stadium typeOfStadium = typeOfStadiumMapper.toType(request);
        return typeRepository.save(typeOfStadium);
    }

    public List<Type_Of_Stadium> getType(){
        return typeRepository.findAll();
    }

    public TypeOfStadiumResponse findType(int typeId){
        return typeOfStadiumMapper.toTypeResponse(typeRepository.findById(typeId)
                .orElseThrow(()-> new AppException(ErrorCode.TYPE_OF_STADIUM_NOT_EXISTED)));
    }

    public TypeOfStadiumResponse updateType(int typeId, TypeOfStadiumUpdateRequest request){
        Type_Of_Stadium type = typeRepository.findById(typeId).orElseThrow(()->
                new AppException(ErrorCode.TYPE_OF_STADIUM_NOT_EXISTED));
        if(typeRepository.existsByTypeName(request.getTypeName())){
            throw new AppException(ErrorCode.TYPE_OF_STADIUM_EXISTED);
        }
        typeOfStadiumMapper.updateType(type, request);
        return typeOfStadiumMapper.toTypeResponse(typeRepository.save(type));
    }

    public void deteleType(int typeId){
        Type_Of_Stadium type = typeRepository.findById(typeId).orElseThrow(()->
                new AppException(ErrorCode.TYPE_OF_STADIUM_NOT_EXISTED));
        typeRepository.deleteById(typeId);
    }
}










