package com.hotel.dto;

import lombok.Data;

@Data
public class RoomDTO {
    private Long id;
    private String roomNumber;
    private String status;
    private Integer floor;
    private Double basePrice;
    private String roomType;
}
