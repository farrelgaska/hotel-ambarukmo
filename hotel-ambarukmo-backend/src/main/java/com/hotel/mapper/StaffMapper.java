package com.hotel.mapper;

import com.hotel.dto.StaffDTO;
import com.hotel.entity.Staff;

public class StaffMapper {
    public static StaffDTO toDTO(Staff staff) {
        if (staff == null) return null;
        StaffDTO dto = new StaffDTO();
        dto.setId(staff.getId());
        dto.setName(staff.getName());
        dto.setUsername(staff.getUsername());
        dto.setEmail(staff.getEmail());
        dto.setPhone(staff.getPhone());
        dto.setDepartment(staff.getDepartment());
        dto.setPosition(staff.getPosition());
        dto.setStatus(staff.getStatus());
        dto.setRole(staff.getRole());
        return dto;
    }
}
