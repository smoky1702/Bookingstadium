package com.example.bookingStadium.controller;


import com.example.bookingStadium.dto.response.ApiResponse;
import com.example.bookingStadium.entity.Image;
import com.example.bookingStadium.service.ImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/images")
public class ImageController {
    @Autowired
    private ImageService imageService;

//    @PostMapping
//    ApiResponse<String> uploadIsmage(@RequestParam("locationId") String locationId
//            ,@RequestParam("imageUrl") MultipartFile file){
//        ApiResponse<String> apiResponse = new ApiResponse<>();
//        return apiResponse.setResult(imageService.uploadImage(file, locationId));
//        try {
//            String imageUrl = imageService.uploadImage(file, locationId);
//            return apiResponse
//        } catch (IOException e) {
//            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
//        }
//    }
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("locationId") String locationId
            ,@RequestParam("imageUrl") MultipartFile file){
        try {
            String imageUrl = imageService.uploadImage(file, locationId);
            return ResponseEntity.ok(imageUrl);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Upload failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<String> deleteImage(@PathVariable String imageId) {
        imageService.deleteImage(imageId);
        return ResponseEntity.ok("Ảnh đã được xóa thành công");
    }

    @GetMapping
    ApiResponse<List<Image>> getImage(){
        List<Image> images = imageService.getAllImages();
        ApiResponse<List<Image>> apiResponse = new ApiResponse<>(images);
        return apiResponse;
    }

    @GetMapping("/imageId")
    ApiResponse<Image> findImage(@PathVariable("/imageId") String imageId){
        ApiResponse<Image> apiResponse = new ApiResponse<>();
        apiResponse.setResult(imageService.findImage(imageId));
        return apiResponse;
    }
}
