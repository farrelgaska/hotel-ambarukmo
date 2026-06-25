package com.hotel.service.interfaces;

import com.hotel.dto.StaffDTO;
import com.hotel.dto.StaffRequestDTO;

import java.util.List;

public interface StaffService {
    List<StaffDTO> getAllStaff();
    StaffDTO createStaff(StaffRequestDTO request);
    StaffDTO updateStaff(Long id, StaffRequestDTO request);
    void deleteStaff(Long id);
}
