package com.hotel.dto;

import lombok.Data;

@Data
public class StaffDTO {
    private Long id;
    private String name;
    private String username;
    private String email;
    private String phone;
    private String department;
    private String position;
    private String status;
    private String role;
}
