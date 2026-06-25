package com.hotel.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ReservationDTO {
    private Long id;
    private String bookingCode;
    private Long roomId;
    private String roomNumber;
    private String guestName;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private String status;
    private Double totalPrice;
}
