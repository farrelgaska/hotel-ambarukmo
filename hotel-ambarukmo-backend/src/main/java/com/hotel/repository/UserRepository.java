package com.hotel.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hotel.abstracts.User;

/**
 * FIX [M4]: Mengubah return type findByUsername() dan findByEmail() dari nullable User
 * menjadi Optional<User>. Ini memaksa caller untuk menangani kasus "tidak ditemukan"
 * secara eksplisit dan menghindari NullPointerException.
 *
 * CATATAN PENTING: Setelah perubahan ini, SEMUA kode yang memanggil findByUsername()
 * atau findByEmail() harus diupdate untuk menggunakan Optional pattern.
 * File yang perlu diupdate:
 * - AuthServiceImpl.java
 * - ReservationController.java (resolveGuest method)
 * - StaffServiceImpl.java
 * - CustomUserDetailsService.java
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Mencari user berdasarkan username.
     * @param username username yang dicari
     * @return Optional<User> — kosong jika tidak ditemukan
     */
    Optional<User> findByUsername(String username);

    /**
     * Mencari user berdasarkan email.
     * @param email email yang dicari
     * @return Optional<User> — kosong jika tidak ditemukan
     */
    Optional<User> findByEmail(String email);

    /**
     * Cek apakah username sudah ada tanpa mengambil seluruh entitas.
     * Lebih efisien dari findByUsername() untuk validasi uniqueness.
     */
    boolean existsByUsername(String username);

    /**
     * Cek apakah email sudah ada tanpa mengambil seluruh entitas.
     */
    boolean existsByEmail(String email);
}