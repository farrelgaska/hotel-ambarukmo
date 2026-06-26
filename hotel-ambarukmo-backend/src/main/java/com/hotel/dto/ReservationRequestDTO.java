package com.hotel.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.Data;

/**
 * ReservationRequestDTO
 *
 * FIX [M8]: Ditambahkan Bean Validation constraint.
 * Sebelumnya semua validasi dilakukan secara manual di service layer.
 * Sekarang Spring Validation (@Valid di controller) akan menangkap input tidak valid
 * sebelum masuk ke service.
 *
 * CATATAN: Tambahkan @Valid pada parameter di ReservationController.createReservation()
 * dan ReservationController.updateReservation() agar validasi ini aktif.
 */
@Data
public class ReservationRequestDTO {

    private Long roomId;

    private Long guestId;

    private String guestName;

    private String roomType;

    @FutureOrPresent(message = "Tanggal check-in tidak boleh di masa lalu")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkIn;

    @Future(message = "Tanggal check-out harus di masa depan")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate checkOut;

    private String status;
}