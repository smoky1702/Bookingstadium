package com.example.bookingStadium.service;



import com.example.bookingStadium.entity.Image;
import com.example.bookingStadium.repository.ImageRepository;
import com.example.bookingStadium.repository.StadiumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class ImageService {

    private final String UPLOAD_DIR = "uploads/";

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private StadiumRepository stadiumRepository;

    @Value("${upload.path}")
    private String uploadDir;

    public String uploadImage(MultipartFile file, String locationId) throws IOException {
        // Kiểm tra nếu file rỗng
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty!");
        }


        // Tạo folder lưu trữ nếu chưa có
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Định danh file bằng UUID để tránh trùng lặp
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        // Lưu file vào thư mục trên server
        Files.copy(file.getInputStream(), filePath);

        // Lưu đường dẫn vào DB
        String fileUrl = "/uploads/" + fileName;
        Image image = new Image();
        image.setLocationId(locationId);
        image.setImageUrl(fileUrl);
        imageRepository.save(image);

        return fileUrl; // Trả về URL của file
//        return imageRepository.save(image);
    }

    public void deleteImage(String imageId) {
        // Tìm ảnh trong database
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ảnh với ID: " + imageId));

        // Xóa file vật lý trên server
        String imagePath = uploadDir + "/" + Paths.get(image.getImageUrl()).getFileName();
        try {
            Files.deleteIfExists(Paths.get(imagePath));
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi xóa file: " + imagePath, e);
        }

        // Xóa ảnh trong database
        imageRepository.delete(image);
    }

    public Image findImage(String imageId) {
        return imageRepository.findById(imageId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy ảnh với ID: " + imageId));
    }

    public List<Image> getAllImages() {
        return imageRepository.findAll();
    }


}






















