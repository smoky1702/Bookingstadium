package com.example.bookingStadium.mapper;


import com.example.bookingStadium.dto.request.Booking.BookingCreationRequest;
import com.example.bookingStadium.dto.request.Booking.BookingUpdateRequest;
import com.example.bookingStadium.dto.response.Booking.BookingResponse;
import com.example.bookingStadium.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;


@Mapper(componentModel = "spring")
public interface StadiumBookingMapper {
    Booking toBooking(BookingCreationRequest request);
    BookingResponse toBookingMapper(Booking booking);
    void updateBooking(@MappingTarget Booking booking, BookingUpdateRequest request);
}
