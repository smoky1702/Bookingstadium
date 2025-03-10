package com.example.bookingStadium.service;

import com.example.bookingStadium.dto.request.Detail.StadiumBookingDetailRequest;
import com.example.bookingStadium.dto.response.Detail.StadiumBookingDetailResponse;
import com.example.bookingStadium.entity.StadiumBookingDetail;
import com.example.bookingStadium.mapper.StadiumBookingDetailMapper;
import com.example.bookingStadium.repository.StadiumBookingDetailRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StadiumBookingDetailService {
    @Autowired
    private StadiumBookingDetailRepository stadiumBookingDetailRepository;

    @Autowired
    private StadiumBookingDetailMapper stadiumBookingDetailMapper;

    public StadiumBookingDetailResponse createBookingDetail(StadiumBookingDetailRequest request) {
        StadiumBookingDetail detail = stadiumBookingDetailMapper.toEntity(request);
        StadiumBookingDetail savedDetail = stadiumBookingDetailRepository.save(detail);
        return stadiumBookingDetailMapper.toResponse(savedDetail);
    }

    public List<StadiumBookingDetailResponse> getAllBookingDetails() {
        List<StadiumBookingDetail> details = stadiumBookingDetailRepository.findAll();
        return details.stream()
                .map(stadiumBookingDetailMapper::toResponse)
                .toList();
    }

    public StadiumBookingDetailResponse getBookingDetailById(String bookingId, String stadiumId, int typeId) {
        StadiumBookingDetail detail = stadiumBookingDetailRepository.findByBookingIdAndStadiumIdAndTypeId(bookingId, stadiumId, typeId)
                .orElseThrow(() -> new RuntimeException("Booking detail not found"));
        return stadiumBookingDetailMapper.toResponse(detail);
    }

    public List<StadiumBookingDetailResponse> getBookingDetailsByBookingId(String bookingId) {
        List<StadiumBookingDetail> details = stadiumBookingDetailRepository.findByBookingId(bookingId);
        return details.stream()
                .map(stadiumBookingDetailMapper::toResponse)
                .toList();
    }

    public StadiumBookingDetailResponse updateBookingDetail(String bookingId, String stadiumId, int typeId, StadiumBookingDetailRequest request) {
        // Tìm bản ghi hiện tại
        StadiumBookingDetail existingDetail = stadiumBookingDetailRepository.findByBookingIdAndStadiumIdAndTypeId(bookingId, stadiumId, typeId)
                .orElseThrow(() -> new RuntimeException("Booking detail not found"));

        // Cập nhật các trường cần thiết
        existingDetail.setQuantity(request.getQuantity());
        existingDetail.setDuration(request.getDuration());
        existingDetail.setPrice(request.getPrice());

        // Lưu bản ghi đã cập nhật
        StadiumBookingDetail updatedDetail = stadiumBookingDetailRepository.save(existingDetail);
        return stadiumBookingDetailMapper.toResponse(updatedDetail);
    }

    @Transactional
    public void deleteBookingDetail(String bookingId, String stadiumId, int typeId) {
        stadiumBookingDetailRepository.deleteByBookingIdAndStadiumIdAndTypeId(bookingId, stadiumId, typeId);
        System.out.println("Booking Detail deleted successfully.");
    }
}