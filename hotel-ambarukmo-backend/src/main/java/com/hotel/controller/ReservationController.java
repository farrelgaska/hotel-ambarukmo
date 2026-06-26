package com.hotel.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hotel.abstracts.controller.BaseController;
import com.hotel.abstracts.dto.BaseResponse;
import com.hotel.dto.ReservationDTO;
import com.hotel.dto.ReservationRequestDTO;
import com.hotel.entity.Guest;
import com.hotel.exception.BadRequestException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.repository.UserRepository;
import com.hotel.service.interfaces.ReservationService;

/**
 * ReservationController
 *
 * FIX [C5] & [M4]: resolveGuest() diupdate menggunakan Optional<User>.
 * Sebelumnya findByUsername() return null tanpa check → NullPointerException jika user tidak ada.
 */
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
                "Reservasi berhasil dibuat",
                HttpStatus.CREATED
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse<ReservationDTO>> updateReservation(
            @PathVariable Long id,
            @RequestBody ReservationRequestDTO reservation
    ) {
        return successResponse(reservationService.updateReservation(id, reservation), "Reservasi berhasil diupdate");
    }

    @PatchMapping("/{id}/checkin")
    public ResponseEntity<BaseResponse<ReservationDTO>> checkIn(@PathVariable Long id) {
        return successResponse(reservationService.checkIn(id), "Check-in berhasil");
    }

    @PatchMapping("/{id}/checkout")
    public ResponseEntity<BaseResponse<ReservationDTO>> checkOut(@PathVariable Long id) {
        return successResponse(reservationService.checkOut(id), "Check-out berhasil");
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
        return successResponse(null, "Reservasi berhasil dibatalkan");
    }

    /**
     * FIX [C5] & [M4]: Gunakan Optional.orElseThrow() — tidak ada lagi NPE risk.
     * Sebelumnya: findByUsername() return null → instanceof check bypass → NPE.
     */
    private Guest resolveGuest(Authentication authentication) {
        var user = userRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        if (!(user instanceof Guest guest)) {
            throw new BadRequestException("Hanya akun tamu yang dapat mengakses resource ini");
        }
        return guest;
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_" + role));
    }
}