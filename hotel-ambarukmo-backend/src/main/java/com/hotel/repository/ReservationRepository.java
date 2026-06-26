package com.hotel.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.hotel.entity.Reservation;

/**
 * ReservationRepository
 *
 * FIX [M1]: Ditambahkan query untuk cek double booking (overlap tanggal).
 *           Sebelumnya tidak ada validasi ini sehingga kamar yang sama bisa dipesan
 *           untuk tanggal yang bertampangan.
 */
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByGuestId(Long guestId);

    Optional<Reservation> findByBookingCode(String bookingCode);

    /**
     * FIX [M1]: Cek apakah ada reservasi aktif untuk kamar tertentu yang overlap dengan
     * rentang tanggal yang diminta. Ini mencegah double booking.
     *
     * Logika overlap: dua periode [A, B] dan [C, D] overlap jika A < D AND B > C.
     * Status CANCELLED dan CHECKED_OUT tidak dihitung sebagai reservasi aktif.
     *
     * @param roomId    ID kamar yang akan dicek
     * @param checkIn   Tanggal check-in baru
     * @param checkOut  Tanggal check-out baru
     * @param excludeId ID reservasi yang dikecualikan (untuk update/edit)
     * @return true jika ada overlap, false jika tidak ada konflik
     */
    @Query("""
        SELECT COUNT(r) > 0
        FROM Reservation r
        WHERE r.room.id = :roomId
          AND r.status NOT IN ('CANCELLED', 'CHECKED_OUT')
          AND r.checkIn < :checkOut
          AND r.checkOut > :checkIn
          AND r.id != :excludeId
        """)
    boolean existsOverlappingReservation(
        @Param("roomId") Long roomId,
        @Param("checkIn") LocalDate checkIn,
        @Param("checkOut") LocalDate checkOut,
        @Param("excludeId") Long excludeId
    );

    /**
     * Cari reservasi berdasarkan status untuk dashboard.
     * Lebih efisien dari findAll() + filter di Java.
     */
    List<Reservation> findByStatus(String status);

    /**
     * FIX [C6]: Ambil total revenue langsung dari database, bukan load semua reservasi.
     * Dipakai di DashboardController untuk menghindari findAll() berulang.
     */
    @Query("SELECT COALESCE(SUM(r.totalPrice), 0) FROM Reservation r WHERE r.totalPrice IS NOT NULL")
    Double sumTotalRevenue();

    /**
     * FIX [C6]: Hitung revenue per bulan untuk chart finansial.
     */
    @Query("""
        SELECT COALESCE(SUM(r.totalPrice), 0)
        FROM Reservation r
        WHERE YEAR(r.checkIn) = :year
          AND MONTH(r.checkIn) = :month
          AND r.totalPrice IS NOT NULL
        """)
    Double sumRevenueByMonth(@Param("year") int year, @Param("month") int month);

    /**
     * FIX [C6]: Hitung jumlah tamu yang saat ini checked-in.
     */
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.status = 'CHECKED_IN'")
    long countCheckedIn();
}