package com.hotel.mapper;

import com.hotel.dto.ReservationDTO;
import com.hotel.entity.Reservation;
import com.hotel.abstracts.BaseEntity;

public class ReservationMapper {
    public static ReservationDTO toDTO(Reservation reservation) {
        if (reservation == null) return null;
        ReservationDTO dto = new ReservationDTO();
        dto.setId(reservation.getId());
        dto.setBookingCode(reservation.getBookingCode());
        if (reservation.getRoom() != null) {
            dto.setRoomId(reservation.getRoom().getId());
            dto.setRoomNumber(reservation.getRoom().getRoomNumber());
        }
        if (reservation.getGuest() != null) {
            dto.setGuestName(reservation.getGuest().getName());
        } else {
            dto.setGuestName(reservation.getGuestName());
        }
        dto.setCheckIn(reservation.getCheckIn());
        dto.setCheckOut(reservation.getCheckOut());
        dto.setStatus(reservation.getStatus());
        dto.setTotalPrice(reservation.getTotalPrice());
        return dto;
    }
}
