package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.request.TypeOfStadium.TypeOfStadiumCreationRequest;
import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.dto.request.TypeOfStadium.TypeOfStadiumUpdateRequest;
import com.example.bookingStadium.dto.response.TypeOfStadiumResponse;
import com.example.bookingStadium.entity.Type_Of_Stadium;
import com.example.bookingStadium.service.TypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/type")
public class TypeOfStadiumController {
    @Autowired
    private TypeService typeService;

    @PostMapping
    ApiResponse<Type_Of_Stadium> createTypeOfStadium(@RequestBody @Valid TypeOfStadiumCreationRequest request){
        ApiResponse<Type_Of_Stadium> apiResponse = new ApiResponse<>();
        apiResponse.setResult(typeService.createType(request));
        return apiResponse;
    }

//    @GetMapping
//    public List<Type_Of_Stadium> getType(){
//        return typeService.getType();
//    }
    @GetMapping
    public ApiResponse<List<Type_Of_Stadium>> getType() {
        List<Type_Of_Stadium> type = typeService.getType();
        ApiResponse<List<Type_Of_Stadium>> apiResponse = new ApiResponse<>(type);
        return apiResponse;
    }


    @GetMapping("/{typeId}")
    ApiResponse<TypeOfStadiumResponse> findType(@PathVariable("typeId") int typeId){
        ApiResponse<TypeOfStadiumResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(typeService.findType(typeId));
        return apiResponse;
    }

    @PutMapping("/{typeId}")
    ApiResponse<TypeOfStadiumResponse> updateType(@PathVariable("typeId") int typeId
            , @RequestBody TypeOfStadiumUpdateRequest request){
        ApiResponse<TypeOfStadiumResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResult(typeService.updateType(typeId, request));
        return apiResponse;
    }

    @DeleteMapping("/{typeId}")
    public String deleteType(@PathVariable("typeId") int typeId){

        typeService.deteleType(typeId);
        return "Type of stadium has been deleted";
    }
}













