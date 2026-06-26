package com.hotel.controller;

import com.hotel.abstracts.controller.BaseController;
import com.hotel.abstracts.dto.BaseResponse;
import com.hotel.repository.ReservationRepository;
import com.hotel.repository.RoomRepository;
import com.hotel.service.interfaces.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DashboardController
 *
 * FIX [C6] & [M9]: Eliminasi N+1 query / full-scan berulang.
 *
 * SEBELUM (masalah):
 *   - reservationRepository.findAll() dipanggil 6x dalam getStats() saja
 *   - roomRepository.findAll() / findByStatus() dipanggil berkali-kali
 *   - calculateRevenueTrend() memanggil findAll() lagi 2x
 *
 * SESUDAH (perbaikan):
 *   - Gunakan query agregasi langsung di database (sumTotalRevenue, sumRevenueByMonth, countCheckedIn)
 *   - findByStatus() hanya dipanggil sekali per status yang diperlukan
 *   - Tidak ada Java-side filtering dari full table scan
 */
@RestController
@RequestMapping("/api")
public class DashboardController extends BaseController {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final SettingsService settingsService;

    public DashboardController(
            RoomRepository roomRepository,
            ReservationRepository reservationRepository,
            SettingsService settingsService
    ) {
        this.roomRepository = roomRepository;
        this.reservationRepository = reservationRepository;
        this.settingsService = settingsService;
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getStats() {
        long totalRooms     = roomRepository.count();
        long availableRooms = roomRepository.countByStatus("AVAILABLE");
        long bookedRooms    = roomRepository.countByStatus("BOOKED");
        long occupiedRooms  = roomRepository.countByStatus("OCCUPIED");
        long activeRooms    = bookedRooms + occupiedRooms;
        long totalBookings  = reservationRepository.count();

        // FIX [C6]: Gunakan query agregasi — tidak perlu load semua reservasi ke memori
        Double totalRevenue = reservationRepository.sumTotalRevenue();
        if (totalRevenue == null) totalRevenue = 0.0;

        // FIX [C6]: Gunakan countCheckedIn() — tidak perlu filter Java-side
        long guestsInHouse = reservationRepository.countCheckedIn();

        int occupancyRate = totalRooms == 0 ? 0 : (int) Math.round((activeRooms * 100.0) / totalRooms);

        // FIX [M9]: Revenue trend menggunakan query per bulan, bukan findAll()
        int revenueTrend = calculateRevenueTrend();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue",   totalRevenue);
        stats.put("totalBookings",  totalBookings);
        stats.put("availableRooms", availableRooms);
        stats.put("occupancyRate",  occupancyRate);
        stats.put("activeRooms",    activeRooms);
        stats.put("totalRooms",     totalRooms);
        stats.put("guestsInHouse",  guestsInHouse);
        stats.put("revenueTrend",   revenueTrend);

        return successResponse(stats);
    }

    @GetMapping("/financials/summary")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getFinancialSummary() {
        // FIX [C6]: sumTotalRevenue() adalah agregasi di DB, bukan Java stream
        Double totalRevenue = reservationRepository.sumTotalRevenue();
        return successResponse(Map.of(
                "totalRevenue",     totalRevenue != null ? totalRevenue : 0.0,
                "totalTransactions", reservationRepository.count(),
                "status", "ok"
        ));
    }

    @GetMapping("/financials/chart")
    public ResponseEntity<BaseResponse<List<Map<String, Object>>>> getChartData(
            @RequestParam(required = false) Integer year
    ) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        List<Map<String, Object>> chartData = buildMonthlyRevenue(targetYear);
        return successResponse(chartData);
    }

    @GetMapping("/financials/transactions")
    public ResponseEntity<BaseResponse<List<Map<String, Object>>>> getTransactions() {
        // Untuk transactions list kita masih perlu data detail, tapi bisa dibatasi
        // TODO: Tambahkan pagination agar tidak load semua data sekaligus
        List<Map<String, Object>> transactions = reservationRepository.findAll().stream()
                .map(r -> {
                    Map<String, Object> tx = new HashMap<>();
                    tx.put("id", r.getId());
                    tx.put("bookingCode", r.getBookingCode());
                    tx.put("guestName", r.getGuestName());
                    tx.put("amount", r.getTotalPrice());
                    tx.put("status", r.getStatus());
                    tx.put("date", r.getCheckIn());
                    tx.put("description", "Room Payment - " + (r.getGuestName() != null ? r.getGuestName() : "Guest"));
                    return tx;
                })
                .toList();
        return successResponse(transactions);
    }

    @PostMapping("/financials/export")
    public ResponseEntity<BaseResponse<Map<String, String>>> exportReport(
            @RequestParam(defaultValue = "pdf") String format
    ) {
        return successResponse(Map.of(
                "format",      format,
                "downloadUrl", "/api/financials/transactions",
                "message",     "Report export simulated successfully"
        ));
    }

    @GetMapping("/settings/hotel")
    public ResponseEntity<BaseResponse<Map<String, String>>> getHotelProfile() {
        return successResponse(settingsService.getHotelProfile());
    }

    @PutMapping("/settings/hotel")
    public ResponseEntity<BaseResponse<Map<String, String>>> updateHotelProfile(
            @RequestBody Map<String, String> profile
    ) {
        return successResponse(settingsService.updateHotelProfile(profile), "Hotel profile updated");
    }

    @GetMapping("/settings/preferences")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getPreferences() {
        return successResponse(settingsService.getPreferences());
    }

    @PutMapping("/settings/preferences")
    public ResponseEntity<BaseResponse<Map<String, Object>>> updatePreferences(
            @RequestBody Map<String, Object> preferences
    ) {
        return successResponse(settingsService.updatePreferences(preferences), "Preferences updated");
    }

    /**
     * FIX [M9]: calculateRevenueTrend menggunakan query per bulan — tidak findAll()
     */
    private int calculateRevenueTrend() {
        LocalDate now = LocalDate.now();
        Double currentMonth  = reservationRepository.sumRevenueByMonth(now.getYear(), now.getMonthValue());
        LocalDate previous   = now.minusMonths(1);
        Double previousMonth = reservationRepository.sumRevenueByMonth(previous.getYear(), previous.getMonthValue());

        double curr = currentMonth  != null ? currentMonth  : 0.0;
        double prev = previousMonth != null ? previousMonth : 0.0;

        if (prev == 0) return curr > 0 ? 100 : 0;
        return (int) Math.round(((curr - prev) / prev) * 100);
    }

    /**
     * FIX [C6]: buildMonthlyRevenue menggunakan sumRevenueByMonth() per bulan.
     * 12 query ke DB lebih baik daripada load ribuan baris reservation ke Java.
     */
    private List<Map<String, Object>> buildMonthlyRevenue(int year) {
        String[] labels = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        List<Map<String, Object>> chartData = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            Double revenue = reservationRepository.sumRevenueByMonth(year, month);
            Map<String, Object> point = new HashMap<>();
            point.put("month",   labels[month - 1]);
            point.put("revenue", revenue != null ? revenue : 0.0);
            chartData.add(point);
        }
        return chartData;
    }
}