package com.hotel.service.impl;

import com.hotel.dto.StaffDTO;
import com.hotel.dto.StaffRequestDTO;
import com.hotel.entity.Staff;
import com.hotel.exception.BadRequestException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.mapper.StaffMapper;
import com.hotel.repository.StaffRepository;
import com.hotel.repository.UserRepository;
import com.hotel.service.interfaces.StaffService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffServiceImpl(StaffRepository staffRepository, UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<StaffDTO> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(StaffMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public StaffDTO createStaff(StaffRequestDTO request) {
        String username = resolveUsername(request);
        if (userRepository.findByUsername(username) != null) {
            throw new BadRequestException("Username already exists");
        }

        Staff staff = new Staff();
        staff.setUsername(username);
        staff.setEmail(resolveEmail(request, username));
        applyRequest(staff, request);
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            staff.setPassword(passwordEncoder.encode("staff123"));
        } else {
            staff.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return StaffMapper.toDTO(staffRepository.save(staff));
    }

    @Override
    public StaffDTO updateStaff(Long id, StaffRequestDTO request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        applyRequest(staff, request);
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            staff.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return StaffMapper.toDTO(staffRepository.save(staff));
    }

    @Override
    public void deleteStaff(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new ResourceNotFoundException("Staff not found");
        }
        staffRepository.deleteById(id);
    }

    private void applyRequest(Staff staff, StaffRequestDTO request) {
        if (request.getName() != null) staff.setName(request.getName());
        if (request.getUsername() != null && !request.getUsername().isBlank()) staff.setUsername(request.getUsername());
        if (request.getEmail() != null && !request.getEmail().isBlank()) staff.setEmail(request.getEmail());
        if (request.getPhone() != null) staff.setPhone(request.getPhone());
        if (request.getDepartment() != null) staff.setDepartment(request.getDepartment());
        if (request.getPosition() != null) staff.setPosition(request.getPosition());
        if (request.getStatus() != null) staff.setStatus(request.getStatus());
    }

    private String resolveUsername(StaffRequestDTO request) {
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            return request.getUsername().trim().toLowerCase();
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Staff name is required");
        }
        String base = request.getName().trim().toLowerCase().replaceAll("[^a-z0-9]+", ".");
        String candidate = base;
        int suffix = 1;
        while (userRepository.findByUsername(candidate) != null) {
            candidate = base + suffix++;
        }
        return candidate;
    }

    private String resolveEmail(StaffRequestDTO request, String username) {
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            return request.getEmail().trim();
        }
        return username + "@hotelambarukmo.com";
    }
}
