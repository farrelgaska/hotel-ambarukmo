package com.hotel.controller;

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
import java.util.stream.Collectors;

import com.hotel.abstracts.controller.BaseController;
import com.hotel.abstracts.dto.BaseResponse;

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
        long totalRooms = roomRepository.count();
        long availableRooms = roomRepository.findByStatus("AVAILABLE").size();
        long occupiedRooms = roomRepository.findByStatus("OCCUPIED").size() + roomRepository.findByStatus("BOOKED").size();
        long totalBookings = reservationRepository.count();
        double totalRevenue = reservationRepository.findAll().stream()
                .mapToDouble(r -> r.getTotalPrice() != null ? r.getTotalPrice() : 0)
                .sum();
        int occupancyRate = totalRooms == 0 ? 0 : (int) Math.round((occupiedRooms * 100.0) / totalRooms);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRevenue", totalRevenue);
        stats.put("totalBookings", totalBookings);
        stats.put("availableRooms", availableRooms);
        stats.put("occupancyRate", occupancyRate);
        stats.put("activeRooms", occupiedRooms);
        stats.put("totalRooms", totalRooms);
        stats.put("guestsInHouse", reservationRepository.findAll().stream()
                .filter(r -> "CHECKED_IN".equals(r.getStatus()))
                .count());
        stats.put("revenueTrend", calculateRevenueTrend());

        return successResponse(stats);
    }

    @GetMapping("/financials/summary")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getFinancialSummary() {
        double totalRevenue = reservationRepository.findAll().stream()
                .mapToDouble(r -> r.getTotalPrice() != null ? r.getTotalPrice() : 0)
                .sum();
        return successResponse(Map.of(
                "totalRevenue", totalRevenue,
                "totalTransactions", reservationRepository.count(),
                "status", "ok"
        ));
    }

    @GetMapping("/financials/chart")
    public ResponseEntity<BaseResponse<List<Map<String, Object>>>> getChartData(@RequestParam(required = false) Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();
        List<Map<String, Object>> chartData = buildMonthlyRevenue(targetYear);
        return successResponse(chartData);
    }

    @GetMapping("/financials/transactions")
    public ResponseEntity<BaseResponse<List<Map<String, Object>>>> getTransactions() {
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
    public ResponseEntity<BaseResponse<Map<String, String>>> exportReport(@RequestParam(defaultValue = "pdf") String format) {
        return successResponse(Map.of(
                "format", format,
                "downloadUrl", "/api/financials/transactions",
                "message", "Report export simulated successfully"
        ));
    }

    @GetMapping("/settings/hotel")
    public ResponseEntity<BaseResponse<Map<String, String>>> getHotelProfile() {
        return successResponse(settingsService.getHotelProfile());
    }

    @PutMapping("/settings/hotel")
    public ResponseEntity<BaseResponse<Map<String, String>>> updateHotelProfile(@RequestBody Map<String, String> profile) {
        return successResponse(settingsService.updateHotelProfile(profile), "Hotel profile updated");
    }

    @GetMapping("/settings/preferences")
    public ResponseEntity<BaseResponse<Map<String, Object>>> getPreferences() {
        return successResponse(settingsService.getPreferences());
    }

    @PutMapping("/settings/preferences")
    public ResponseEntity<BaseResponse<Map<String, Object>>> updatePreferences(@RequestBody Map<String, Object> preferences) {
        return successResponse(settingsService.updatePreferences(preferences), "Preferences updated");
    }

    private int calculateRevenueTrend() {
        LocalDate now = LocalDate.now();
        double currentMonth = sumRevenueForMonth(now.getYear(), now.getMonthValue());
        LocalDate previous = now.minusMonths(1);
        double previousMonth = sumRevenueForMonth(previous.getYear(), previous.getMonthValue());
        if (previousMonth == 0) {
            return currentMonth > 0 ? 100 : 0;
        }
        return (int) Math.round(((currentMonth - previousMonth) / previousMonth) * 100);
    }

    private double sumRevenueForMonth(int year, int month) {
        return reservationRepository.findAll().stream()
                .filter(r -> r.getCheckIn() != null && r.getCheckIn().getYear() == year && r.getCheckIn().getMonthValue() == month)
                .mapToDouble(r -> r.getTotalPrice() != null ? r.getTotalPrice() : 0)
                .sum();
    }

    private List<Map<String, Object>> buildMonthlyRevenue(int year) {
        String[] labels = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        List<Map<String, Object>> chartData = new ArrayList<>();
        for (int month = 1; month <= 12; month++) {
            Map<String, Object> point = new HashMap<>();
            point.put("month", labels[month - 1]);
            point.put("revenue", sumRevenueForMonth(year, month));
            chartData.add(point);
        }
        return chartData;
    }
}
