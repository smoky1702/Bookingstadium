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

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("stadiumId") String locationId
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

    @GetMapping("/{imageId}")
    ApiResponse<Image> findImage(@PathVariable("imageId") String imageId){
        ApiResponse<Image> apiResponse = new ApiResponse<>();
        apiResponse.setResult(imageService.findImage(imageId));
        return apiResponse;
    }

    @PutMapping("/update/{imageId}")
    public ApiResponse<String> updateImage(@PathVariable("imageId") String imageId,
                                           @RequestParam("file") MultipartFile newFile) throws IOException {
        ApiResponse<String> apiResponse = new ApiResponse<>();
        apiResponse.setResult(imageService.updateImage(imageId, newFile));
        return apiResponse;
    }
}
