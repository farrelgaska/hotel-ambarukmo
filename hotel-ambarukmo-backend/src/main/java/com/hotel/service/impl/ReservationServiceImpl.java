package com.hotel.service.impl;

import com.hotel.entity.Reservation;
import com.hotel.abstracts.Room;
import com.hotel.entity.Guest;
import com.hotel.dto.ReservationDTO;
import com.hotel.dto.ReservationRequestDTO;
import com.hotel.mapper.ReservationMapper;
import com.hotel.exception.BadRequestException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.exception.UnauthorizedException;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.UserRepository;
import com.hotel.service.interfaces.ReservationService;
import com.hotel.util.PricingStrategy;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.hotel.abstracts.service.BaseService;

@Service
@Transactional
public class ReservationServiceImpl extends BaseService<Reservation, Long> implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final PricingStrategy pricingStrategy;

    public ReservationServiceImpl(ReservationRepository reservationRepository,
                                  RoomRepository roomRepository,
                                  UserRepository userRepository,
                                  @Qualifier("standardPricingStrategy") PricingStrategy pricingStrategy) {
        this.reservationRepository = reservationRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.pricingStrategy = pricingStrategy;
    }

    @Override
    protected org.springframework.data.jpa.repository.JpaRepository<Reservation, Long> getRepository() {
        return reservationRepository;
    }

    @Override
    protected String getEntityName() {
        return "Reservation";
    }

    @Override
    public List<ReservationDTO> getAllReservations() {
        return findAll().stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ReservationDTO> getMyReservations(Long guestId) {
        return reservationRepository.findByGuestId(guestId).stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ReservationDTO getReservationById(Long id) {
        return ReservationMapper.toDTO(findByIdOrThrow(id));
    }

    @Override
    public ReservationDTO getReservationByIdForGuest(Long id, Long guestId) {
        Reservation reservation = findByIdOrThrow(id);
        verifyGuestOwnership(reservation, guestId);
        return ReservationMapper.toDTO(reservation);
    }

    public void verifyGuestOwnership(Reservation reservation, Long guestId) {
        if (reservation.getGuest() == null || !reservation.getGuest().getId().equals(guestId)) {
            throw new UnauthorizedException("You are not allowed to access this reservation");
        }
    }

    @Override
    public ReservationDTO createReservation(ReservationRequestDTO requestDTO, Long authenticatedGuestId) {
        Long roomId = requestDTO.getRoomId();
        if (roomId == null && requestDTO.getRoomType() != null) {
            Room availableRoom = findAvailableRoomByType(requestDTO.getRoomType());
            roomId = availableRoom.getId();
        }
        if (roomId == null) {
            throw new BadRequestException("Room ID or room type is required");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (!"AVAILABLE".equals(room.getStatus())) {
            throw new BadRequestException("Room is not available");
        }

        if (requestDTO.getCheckIn() == null || requestDTO.getCheckOut() == null) {
            throw new BadRequestException("Check-in and check-out dates are required");
        }

        Reservation reservation = new Reservation();
        reservation.setBookingCode("BKG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        reservation.setRoom(room);
        reservation.setCheckIn(requestDTO.getCheckIn());
        reservation.setCheckOut(requestDTO.getCheckOut());

        Long guestId = requestDTO.getGuestId() != null ? requestDTO.getGuestId() : authenticatedGuestId;
        if (guestId != null) {
            var user = userRepository.findById(guestId)
                    .orElseThrow(() -> new ResourceNotFoundException("Guest not found"));
            if (!(user instanceof Guest guest)) {
                throw new BadRequestException("Invalid guest account");
            }
            reservation.setGuest(guest);
            reservation.setGuestName(guest.getName());
        } else {
            reservation.setGuestName(requestDTO.getGuestName());
        }

        long nights = ChronoUnit.DAYS.between(reservation.getCheckIn(), reservation.getCheckOut());
        if (nights <= 0) nights = 1;

        reservation.setTotalPrice(pricingStrategy.calculatePrice(reservation, (int) nights));
        reservation.setStatus("CONFIRMED");

        room.setStatus("BOOKED");
        roomRepository.save(room);

        Reservation saved = reservationRepository.save(reservation);
        return ReservationMapper.toDTO(saved);
    }

    @Override
    public ReservationDTO updateReservation(Long id, ReservationRequestDTO requestDTO) {
        Reservation reservation = findByIdOrThrow(id);

        if (requestDTO.getCheckIn() != null) {
            reservation.setCheckIn(requestDTO.getCheckIn());
        }
        if (requestDTO.getCheckOut() != null) {
            reservation.setCheckOut(requestDTO.getCheckOut());
        }
        if (requestDTO.getGuestName() != null) {
            reservation.setGuestName(requestDTO.getGuestName());
        }
        if (requestDTO.getStatus() != null && !requestDTO.getStatus().isBlank()) {
            reservation.setStatus(requestDTO.getStatus().toUpperCase());
        }

        if (reservation.getCheckIn() != null && reservation.getCheckOut() != null) {
            long nights = ChronoUnit.DAYS.between(reservation.getCheckIn(), reservation.getCheckOut());
            if (nights <= 0) nights = 1;
            reservation.setTotalPrice(pricingStrategy.calculatePrice(reservation, (int) nights));
        }

        return ReservationMapper.toDTO(save(reservation));
    }

    @Override
    public ReservationDTO checkIn(Long id) {
        Reservation reservation = findByIdOrThrow(id);
        reservation.setStatus("CHECKED_IN");

        Room room = reservation.getRoom();
        room.setStatus("OCCUPIED");
        roomRepository.save(room);

        return ReservationMapper.toDTO(save(reservation));
    }

    @Override
    public ReservationDTO checkOut(Long id) {
        Reservation reservation = findByIdOrThrow(id);
        reservation.setStatus("CHECKED_OUT");

        Room room = reservation.getRoom();
        room.setStatus("AVAILABLE");
        roomRepository.save(room);

        return ReservationMapper.toDTO(save(reservation));
    }

    @Override
    public void deleteReservation(Long id) {
        deleteReservation(id, null);
    }

    @Override
    public void deleteReservation(Long id, Long guestId) {
        Reservation reservation = findByIdOrThrow(id);
        if (guestId != null) {
            verifyGuestOwnership(reservation, guestId);
        }
        Room room = reservation.getRoom();
        if (room != null && !"CHECKED_OUT".equals(reservation.getStatus())) {
            room.setStatus("AVAILABLE");
            roomRepository.save(room);
        }
        reservation.setStatus("CANCELLED");
        reservationRepository.save(reservation);
    }

    private Room findAvailableRoomByType(String roomType) {
        String normalized = roomType.toLowerCase();
        return roomRepository.findByStatus("AVAILABLE").stream()
                .filter(room -> room.getRoomType().toLowerCase().contains(normalized)
                        || normalized.contains(room.getRoomType().toLowerCase()))
                .findFirst()
                .orElseThrow(() -> new BadRequestException("No available room for type: " + roomType));
    }
}
