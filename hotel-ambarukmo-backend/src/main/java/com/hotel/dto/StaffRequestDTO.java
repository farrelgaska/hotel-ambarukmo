package com.hotel.dto;

import lombok.Data;

@Data
public class StaffRequestDTO {
    private String name;
    private String username;
    private String email;
    private String phone;
    private String department;
    private String position;
    private String status;
    private String password;
}
