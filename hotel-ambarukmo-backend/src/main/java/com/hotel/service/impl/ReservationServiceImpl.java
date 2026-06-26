package com.hotel.service.impl;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotel.abstracts.Room;
import com.hotel.abstracts.service.BaseService;
import com.hotel.dto.ReservationDTO;
import com.hotel.dto.ReservationRequestDTO;
import com.hotel.entity.Guest;
import com.hotel.entity.Reservation;
import com.hotel.exception.BadRequestException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.exception.UnauthorizedException;
import com.hotel.mapper.ReservationMapper;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.repository.UserRepository;
import com.hotel.service.interfaces.ReservationService;
import com.hotel.util.PricingStrategy;

/**
 * ReservationServiceImpl
 *
 * FIX [M1]: Ditambahkan validasi double booking menggunakan query di ReservationRepository.
 * FIX [M4]: Diupdate untuk menggunakan Optional<User> dari UserRepository.
 * FIX [C5]: Diperbaiki resolusi Guest dari UserRepository — sudah menggunakan Optional.
 */
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
    @Transactional(readOnly = true)
    public List<ReservationDTO> getAllReservations() {
        return findAll().stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReservationDTO> getMyReservations(Long guestId) {
        return reservationRepository.findByGuestId(guestId).stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationDTO getReservationById(Long id) {
        return ReservationMapper.toDTO(findByIdOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public ReservationDTO getReservationByIdForGuest(Long id, Long guestId) {
        Reservation reservation = findByIdOrThrow(id);
        verifyGuestOwnership(reservation, guestId);
        return ReservationMapper.toDTO(reservation);
    }

    public void verifyGuestOwnership(Reservation reservation, Long guestId) {
        if (reservation.getGuest() == null || !reservation.getGuest().getId().equals(guestId)) {
            throw new UnauthorizedException("Anda tidak memiliki akses ke reservasi ini");
        }
    }

    @Override
    public ReservationDTO createReservation(ReservationRequestDTO requestDTO, Long authenticatedGuestId) {
        // Validasi tanggal wajib ada
        if (requestDTO.getCheckIn() == null || requestDTO.getCheckOut() == null) {
            throw new BadRequestException("Tanggal check-in dan check-out wajib diisi");
        }
        if (!requestDTO.getCheckOut().isAfter(requestDTO.getCheckIn())) {
            throw new BadRequestException("Tanggal check-out harus setelah check-in");
        }
        if (requestDTO.getCheckIn().isBefore(LocalDate.now())) {
            throw new BadRequestException("Tanggal check-in tidak boleh di masa lalu");
        }

        // Resolusi room ID
        Long roomId = requestDTO.getRoomId();
        if (roomId == null && requestDTO.getRoomType() != null) {
            Room availableRoom = findAvailableRoomByType(requestDTO.getRoomType());
            roomId = availableRoom.getId();
        }
        if (roomId == null) {
            throw new BadRequestException("Room ID atau tipe kamar wajib diisi");
        }

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Kamar tidak ditemukan"));

        if (!"AVAILABLE".equals(room.getStatus())) {
            throw new BadRequestException("Kamar " + room.getRoomNumber() + " tidak tersedia");
        }

        // FIX [M1]: Cek double booking — validasi overlap tanggal
        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                roomId,
                requestDTO.getCheckIn(),
                requestDTO.getCheckOut(),
                -1L // -1 = tidak ada reservasi yang dikecualikan (ini create baru)
        );
        if (hasOverlap) {
            throw new BadRequestException(
                "Kamar " + room.getRoomNumber() + " sudah dipesan pada rentang tanggal tersebut. "
                + "Silakan pilih tanggal atau kamar lain."
            );
        }

        Reservation reservation = new Reservation();
        reservation.setBookingCode("BKG-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        reservation.setRoom(room);
        reservation.setCheckIn(requestDTO.getCheckIn());
        reservation.setCheckOut(requestDTO.getCheckOut());

        // Resolusi guest
        Long guestId = requestDTO.getGuestId() != null ? requestDTO.getGuestId() : authenticatedGuestId;
        if (guestId != null) {
            // FIX [C5] & [M4]: Gunakan Optional — tidak ada lagi instanceof + null cast unsafe
            var user = userRepository.findById(guestId)
                    .orElseThrow(() -> new ResourceNotFoundException("Tamu tidak ditemukan"));
            if (!(user instanceof Guest guest)) {
                throw new BadRequestException("Akun tidak valid sebagai tamu");
            }
            reservation.setGuest(guest);
            reservation.setGuestName(guest.getName());
        } else {
            if (requestDTO.getGuestName() == null || requestDTO.getGuestName().isBlank()) {
                throw new BadRequestException("Nama tamu wajib diisi");
            }
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

        // Jika tanggal diubah, re-validasi overlap (kecualikan reservasi saat ini)
        LocalDate newCheckIn  = requestDTO.getCheckIn()  != null ? requestDTO.getCheckIn()  : reservation.getCheckIn();
        LocalDate newCheckOut = requestDTO.getCheckOut() != null ? requestDTO.getCheckOut() : reservation.getCheckOut();

        if (!newCheckOut.isAfter(newCheckIn)) {
            throw new BadRequestException("Tanggal check-out harus setelah check-in");
        }

        // FIX [M1]: Cek double booking saat update, kecualikan reservasi ini sendiri
        if (requestDTO.getCheckIn() != null || requestDTO.getCheckOut() != null) {
            boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                    reservation.getRoom().getId(),
                    newCheckIn,
                    newCheckOut,
                    id // Kecualikan reservasi ini sendiri dari pengecekan
            );
            if (hasOverlap) {
                throw new BadRequestException(
                    "Kamar sudah dipesan pada rentang tanggal tersebut."
                );
            }
        }

        reservation.setCheckIn(newCheckIn);
        reservation.setCheckOut(newCheckOut);

        if (requestDTO.getGuestName() != null) {
            reservation.setGuestName(requestDTO.getGuestName());
        }
        if (requestDTO.getStatus() != null && !requestDTO.getStatus().isBlank()) {
            reservation.setStatus(requestDTO.getStatus().toUpperCase());
        }

        long nights = ChronoUnit.DAYS.between(reservation.getCheckIn(), reservation.getCheckOut());
        if (nights <= 0) nights = 1;
        reservation.setTotalPrice(pricingStrategy.calculatePrice(reservation, (int) nights));

        return ReservationMapper.toDTO(save(reservation));
    }

    @Override
    public ReservationDTO checkIn(Long id) {
        Reservation reservation = findByIdOrThrow(id);
        if (!"CONFIRMED".equals(reservation.getStatus()) && !"BOOKED".equals(reservation.getStatus())) {
            throw new BadRequestException("Reservasi tidak dapat di-check-in. Status saat ini: " + reservation.getStatus());
        }
        reservation.setStatus("CHECKED_IN");

        Room room = reservation.getRoom();
        room.setStatus("OCCUPIED");
        roomRepository.save(room);

        return ReservationMapper.toDTO(save(reservation));
    }

    @Override
    public ReservationDTO checkOut(Long id) {
        Reservation reservation = findByIdOrThrow(id);
        if (!"CHECKED_IN".equals(reservation.getStatus())) {
            throw new BadRequestException("Reservasi tidak dapat di-check-out. Status saat ini: " + reservation.getStatus());
        }
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
        if ("CHECKED_IN".equals(reservation.getStatus())) {
            throw new BadRequestException("Reservasi yang sedang aktif (CHECKED_IN) tidak dapat dibatalkan.");
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
                .orElseThrow(() -> new BadRequestException("Tidak ada kamar tersedia untuk tipe: " + roomType));
    }
}