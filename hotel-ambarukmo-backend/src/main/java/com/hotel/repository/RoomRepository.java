package com.hotel.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hotel.abstracts.Room;

/**
 * RoomRepository
 *
 * FIX [C6]: Ditambahkan countByStatus() untuk dipakai di DashboardController.
 * Menghindari findByStatus().size() yang load semua entitas hanya untuk menghitung.
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    List<Room> findByStatus(String status);

    Optional<Room> findByRoomNumber(String roomNumber);

    /**
     * FIX [C6]: Hitung jumlah kamar berdasarkan status secara efisien.
     * Menggantikan findByStatus(status).size() yang memuat semua entitas kamar ke memori.
     */
    long countByStatus(String status);
}