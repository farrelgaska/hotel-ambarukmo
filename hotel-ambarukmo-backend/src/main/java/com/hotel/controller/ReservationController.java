package com.hotel.controller;

import com.hotel.dto.ReservationDTO;
import com.hotel.dto.ReservationRequestDTO;
import com.hotel.entity.Guest;
import com.hotel.repository.UserRepository;
import com.hotel.service.interfaces.ReservationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.hotel.abstracts.controller.BaseController;
import com.hotel.abstracts.dto.BaseResponse;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController extends BaseController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;

    public ReservationController(ReservationService reservationService, UserRepository userRepository) {
        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }

    @GetMapping
    public ResponseEntity<BaseResponse<List<ReservationDTO>>> getAllReservations() {
        return successResponse(reservationService.getAllReservations());
    }

    @GetMapping("/my")
    public ResponseEntity<BaseResponse<List<ReservationDTO>>> getMyReservations(Authentication authentication) {
        Guest guest = resolveGuest(authentication);
        return successResponse(reservationService.getMyReservations(guest.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse<ReservationDTO>> getReservationById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (hasRole(authentication, "GUEST")) {
            Guest guest = resolveGuest(authentication);
            return successResponse(reservationService.getReservationByIdForGuest(id, guest.getId()));
        }
        return successResponse(reservationService.getReservationById(id));
    }

    @PostMapping
    public ResponseEntity<BaseResponse<ReservationDTO>> createReservation(
            Authentication authentication,
            @RequestBody ReservationRequestDTO reservation
    ) {
        if (hasRole(authentication, "GUEST")) {
            Guest guest = resolveGuest(authentication);
            reservation.setGuestId(guest.getId());
            reservation.setGuestName(guest.getName());
        }
        return successResponse(
                reservationService.createReservation(reservation, null),
                "Reservation created successfully",
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<ReservationDTO>> updateReservation(
            @PathVariable Long id,
            @RequestBody ReservationRequestDTO reservation
    ) {
        return successResponse(reservationService.updateReservation(id, reservation), "Reservation updated successfully");
    }

    @PatchMapping("/{id}/checkin")
    public ResponseEntity<BaseResponse<ReservationDTO>> checkIn(@PathVariable Long id) {
        return successResponse(reservationService.checkIn(id));
    }

    @PatchMapping("/{id}/checkout")
    public ResponseEntity<BaseResponse<ReservationDTO>> checkOut(@PathVariable Long id) {
        return successResponse(reservationService.checkOut(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse<Void>> deleteReservation(
            @PathVariable Long id,
            Authentication authentication
    ) {
        if (hasRole(authentication, "GUEST")) {
            Guest guest = resolveGuest(authentication);
            reservationService.deleteReservation(id, guest.getId());
        } else {
            reservationService.deleteReservation(id);
        }
        return successResponse(null, "Reservation cancelled successfully");
    }

    private Guest resolveGuest(Authentication authentication) {
        var user = userRepository.findByUsername(authentication.getName());
        if (!(user instanceof Guest guest)) {
            throw new com.hotel.exception.BadRequestException("Only guest accounts can access this resource");
        }
        return guest;
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_" + role));
    }
}
