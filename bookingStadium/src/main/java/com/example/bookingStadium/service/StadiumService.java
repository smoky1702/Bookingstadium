package com.example.bookingStadium.service;

import com.example.bookingStadium.Security.SecurityUtils;
import com.example.bookingStadium.dto.request.Stadium.StadiumCreationRequest;
import com.example.bookingStadium.dto.request.Stadium.StadiumUpdateRequest;
import com.example.bookingStadium.dto.response.StadiumReponse;
import com.example.bookingStadium.entity.Booking;
import com.example.bookingStadium.entity.Stadium;
import com.example.bookingStadium.entity.StadiumBookingDetail;
import com.example.bookingStadium.entity.Stadium_Location;
import com.example.bookingStadium.exception.AppException;
import com.example.bookingStadium.exception.ErrorCode;
import com.example.bookingStadium.mapper.StadiumMapper;
import com.example.bookingStadium.repository.BookingRepository;
import com.example.bookingStadium.repository.StadiumBookingDetailRepository;
import com.example.bookingStadium.repository.StadiumLocationRepository;
import com.example.bookingStadium.repository.StadiumRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Service
public class StadiumService {
    @Autowired
    private StadiumRepository stadiumRepository;
    @Autowired
    private StadiumMapper stadiumMapper;
    @Autowired
    private BookingRepository bookingRepository;
    @Autowired
    private StadiumBookingDetailRepository stadiumBookingDetailRepository;
    @Autowired
    private StadiumLocationRepository stadiumLocationRepository;
    @Autowired
    private SecurityUtils securityUtils;

    @PreAuthorize("hasAuthority('SCOPE_OWNER')")
    public Stadium createStadium(StadiumCreationRequest request){
        Stadium stadium = stadiumMapper.toStadium(request);
        return stadiumRepository.save(stadium);
    }

    public List<Stadium> getStadium(){
        return stadiumRepository.findAll();
    }

    public StadiumReponse findStadium(String stadiumId){
        return stadiumMapper.toStadiumReponse(stadiumRepository.findById(stadiumId)
                .orElseThrow(()->new AppException(ErrorCode.STADIUM_NOT_EXISTED)));
    }

    @PreAuthorize("hasAnyAuthority('SCOPE_OWNER', 'SCOPE_ADMIN', 'ROLE_OWNER', 'ROLE_ADMIN')")
    public StadiumReponse updateStadium(String stadiumId, StadiumUpdateRequest request){
        Stadium stadium = stadiumRepository.findById(stadiumId)
                .orElseThrow(()-> new AppException(ErrorCode.STADIUM_NOT_EXISTED));

        // Kiểm tra quyền: chỉ chủ sở hữu địa điểm hoặc admin mới có thể cập nhật
        String locationId = stadium.getLocationId();
        Stadium_Location location = stadiumLocationRepository.findById(locationId)
                .orElseThrow(() -> new AppException(ErrorCode.STADIUM_LOCATION_NOT_EXISTED));

        if (!securityUtils.isAdmin() &&
                !securityUtils.isCurrentUser(location.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        stadiumMapper.updateStadium(stadium, request);
        return stadiumMapper.toStadiumReponse(stadiumRepository.save(stadium));
    }

    @PreAuthorize("hasAuthority('SCOPE_OWNER')")
    public void detele(String stadiumId){
        Stadium stadium = stadiumRepository.findById(stadiumId)
                .orElseThrow(()-> new AppException(ErrorCode.STADIUM_NOT_EXISTED));

        // Kiểm tra quyền: chỉ chủ sở hữu địa điểm hoặc admin mới có thể xóa
        String locationId = stadium.getLocationId();
        Stadium_Location location = stadiumLocationRepository.findById(locationId)
                .orElseThrow(() -> new AppException(ErrorCode.STADIUM_LOCATION_NOT_EXISTED));

        if (!securityUtils.isAdmin() &&
                !securityUtils.isCurrentUser(location.getUserId())) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        stadiumRepository.deleteById(stadiumId);
    }

    public List<Booking> getStadiumBooking(String stadiumId, LocalDate date) {
        // Kiểm tra sân có tồn tại không
        Stadium stadium = stadiumRepository.findById(stadiumId)
                .orElseThrow(() -> new AppException(ErrorCode.STADIUM_NOT_EXISTED));

        // Lấy locationId của sân
        String locationId = stadium.getLocationId();

        // Lấy tất cả booking theo locationId và date
        List<Booking> allLocationBookings = bookingRepository.findByDateOfBookingAndLocationId(date, locationId);

        // Lọc chỉ giữ lại những booking có stadiumId tương ứng trong StadiumBookingDetail
        List<Booking> stadiumBookings = new ArrayList<>();

        for (Booking booking : allLocationBookings) {
            // Tìm detail cho booking này
            StadiumBookingDetail detail = stadiumBookingDetailRepository.findByBookingId(booking.getBookingId());

            // Kiểm tra xem booking này có thuộc về sân hiện tại không
            if (detail != null && stadiumId.equals(detail.getStadiumId())) {
                stadiumBookings.add(booking);
            }
        }

        return stadiumBookings;
    }
    
    /**
     * Tìm tất cả stadium thuộc quyền sở hữu của owner theo user_id
     */
    public List<Stadium> findByOwnerId(String userId) {
        // Tìm tất cả location thuộc quyền sở hữu của owner
        List<Stadium_Location> locations = stadiumLocationRepository.findByUserId(userId);
        
        // Lấy tất cả stadium thuộc các location này
        List<Stadium> stadiums = new ArrayList<>();
        for (Stadium_Location location : locations) {
            List<Stadium> locationStadiums = stadiumRepository.findByLocationId(location.getLocationId());
            stadiums.addAll(locationStadiums);
        }
        
        return stadiums;
    }
}

