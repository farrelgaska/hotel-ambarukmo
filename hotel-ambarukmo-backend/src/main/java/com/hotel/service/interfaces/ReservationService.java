package com.hotel.service.interfaces;

import com.hotel.dto.ReservationDTO;
import com.hotel.dto.ReservationRequestDTO;
import java.util.List;

public interface ReservationService {
    List<ReservationDTO> getAllReservations();
    List<ReservationDTO> getMyReservations(Long guestId);
    ReservationDTO getReservationById(Long id);
    ReservationDTO getReservationByIdForGuest(Long id, Long guestId);
    ReservationDTO createReservation(ReservationRequestDTO reservationDTO, Long authenticatedGuestId);
    ReservationDTO updateReservation(Long id, ReservationRequestDTO requestDTO);
    ReservationDTO checkIn(Long id);
    ReservationDTO checkOut(Long id);
    void deleteReservation(Long id);
    void deleteReservation(Long id, Long guestId);
}
