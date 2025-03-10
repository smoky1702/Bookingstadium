package com.example.bookingStadium.entity;

import java.io.Serializable;
import java.util.Objects;

public class StadiumBookingDetailId implements Serializable {
    private String bookingId;
    private String stadiumId;
    private int typeId;

    public StadiumBookingDetailId() {}

    public StadiumBookingDetailId(String bookingId, String stadiumId, int typeId) {
        this.bookingId = bookingId;
        this.stadiumId = stadiumId;
        this.typeId = typeId;
    }

    // Getters and Setters

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getStadiumId() {
        return stadiumId;
    }

    public void setStadiumId(String stadiumId) {
        this.stadiumId = stadiumId;
    }

    public int getTypeId() {
        return typeId;
    }

    public void setTypeId(int typeId) {
        this.typeId = typeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof StadiumBookingDetailId)) return false;
        StadiumBookingDetailId that = (StadiumBookingDetailId) o;
        return typeId == that.typeId &&
                Objects.equals(bookingId, that.bookingId) &&
                Objects.equals(stadiumId, that.stadiumId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingId, stadiumId, typeId);
    }
}