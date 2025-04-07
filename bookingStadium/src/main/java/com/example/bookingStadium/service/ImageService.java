package com.example.bookingStadium.service;

import com.example.bookingStadium.entity.Image;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
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


@Service
public class ImageService {

    private final String UPLOAD_DIR = "uploads/";

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private StadiumRepository stadiumRepository;

    @Value("${upload.path}")
    private String uploadDir;

    private String generateUniqueFileName(String originalFilename, String uploadDir) {
        Path filePath = Paths.get(uploadDir, originalFilename);
        
        if (!Files.exists(filePath)) {
            return originalFilename;
        }
        
        int lastDotIndex = originalFilename.lastIndexOf(".");
        String baseName = lastDotIndex > 0 ? originalFilename.substring(0, lastDotIndex) : originalFilename;
        String extension = lastDotIndex > 0 ? originalFilename.substring(lastDotIndex) : "";
        
        int counter = 1;
        String newFileName;
        
        do {
            newFileName = baseName + "_" + counter + extension;
            filePath = Paths.get(uploadDir, newFileName);
            counter++;
        } while (Files.exists(filePath));
        
        return newFileName;
    }

    public String uploadImage(MultipartFile file, String stadiumId) throws IOException {
        // Kiểm tra nếu file rỗng
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File trống!");
        }

        // Kiểm tra stadiumId có hợp lệ không
        if (stadiumId != null && !stadiumId.isEmpty() && !stadiumRepository.existsById(stadiumId)) {
            throw new AppException(ErrorCode.STADIUM_NOT_EXISTED);
        }

        // Tạo folder lưu trữ nếu chưa có
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Tạo tên file không trùng lặp, giữ nguyên tên gốc
        String originalFilename = file.getOriginalFilename();
        String uniqueFileName = generateUniqueFileName(originalFilename, uploadDir);
        Path filePath = uploadPath.resolve(uniqueFileName);

        // Lưu file vào thư mục trên server
        Files.copy(file.getInputStream(), filePath);

        // Lưu đường dẫn vào DB
        String fileUrl = "/uploads/" + uniqueFileName;
        Image image = new Image();
        image.setStadiumId(stadiumId);
        image.setImageUrl(fileUrl);
        imageRepository.save(image);

        return fileUrl;
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
                .orElseThrow(() -> new AppException(ErrorCode.IMAGE_NOT_FOUND));
    }

    public List<Image> getAllImages() {
        return imageRepository.findAll();
    }

    public String updateImage(String imageId, MultipartFile newFile) throws IOException {
        // Kiểm tra nếu file rỗng
        if (newFile.isEmpty()) {
            throw new IllegalArgumentException("File mới không được để trống!");
        }

        // Tìm ảnh cũ trong DB
        Image image = imageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.IMAGE_NOT_FOUND));

        // Xóa file ảnh cũ trên server
        String oldImagePath = uploadDir + "/" + Paths.get(image.getImageUrl()).getFileName();
        try {
            Files.deleteIfExists(Paths.get(oldImagePath));
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi xóa file ảnh cũ: " + oldImagePath, e);
        }

        // Lưu ảnh mới vào server với tên file gốc
        String originalFilename = newFile.getOriginalFilename();
        String uniqueFileName = generateUniqueFileName(originalFilename, uploadDir);
        Path newFilePath = Paths.get(uploadDir).resolve(uniqueFileName);
        Files.copy(newFile.getInputStream(), newFilePath);

        // Cập nhật đường dẫn mới vào DB
        String newFileUrl = "/uploads/" + uniqueFileName;
        image.setImageUrl(newFileUrl);
        imageRepository.save(image);

        return newFileUrl;
    }

    public List<Image> getImagesByStadiumId(String stadiumId) {
        if (stadiumId == null || stadiumId.isEmpty()) {
            throw new IllegalArgumentException("StadiumId không được để trống");
        }
        
        if (!stadiumRepository.existsById(stadiumId)) {
            throw new AppException(ErrorCode.STADIUM_NOT_EXISTED);
        }
        
        return imageRepository.findByStadiumId(stadiumId);
    }
}






















