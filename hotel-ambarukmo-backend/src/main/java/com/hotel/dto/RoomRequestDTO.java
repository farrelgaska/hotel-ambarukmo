package com.hotel.dto;

import lombok.Data;

@Data
public class RoomRequestDTO {
    private String number;
    private String type;
    private String status;
    private Double price;
    private Integer floor;
}
