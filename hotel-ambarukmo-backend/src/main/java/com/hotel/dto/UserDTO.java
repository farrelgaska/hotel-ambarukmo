package com.hotel.dto;

import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String username;
    private String name;
    private String email;
    private String role; // GUEST, STAFF, ADMIN
    private String memberTier;
}
