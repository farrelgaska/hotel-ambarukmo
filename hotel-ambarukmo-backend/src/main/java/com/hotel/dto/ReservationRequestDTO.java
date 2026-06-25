package com.hotel.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ReservationRequestDTO {
    private Long roomId;
    private Long guestId;
    private String guestName;
    private String roomType;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private String status;
}
