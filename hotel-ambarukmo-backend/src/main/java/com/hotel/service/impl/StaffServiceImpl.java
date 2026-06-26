package com.hotel.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotel.dto.StaffDTO;
import com.hotel.dto.StaffRequestDTO;
import com.hotel.entity.Staff;
import com.hotel.exception.BadRequestException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.mapper.StaffMapper;
import com.hotel.repository.StaffRepository;
import com.hotel.repository.UserRepository;
import com.hotel.service.interfaces.StaffService;

/**
 * StaffServiceImpl
 *
 * FIX [M2]: updateStaff() sekarang mengecek duplikasi username ketika username diubah.
 *           Sebelumnya tidak ada pengecekan sehingga bisa terjadi duplicate key error di DB.
 * FIX [M4]: Gunakan Optional & existsBy dari UserRepository.
 */
@Service
@Transactional
public class StaffServiceImpl implements StaffService {

    private final StaffRepository staffRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public StaffServiceImpl(StaffRepository staffRepository, UserRepository userRepository,
                             PasswordEncoder passwordEncoder) {
        this.staffRepository = staffRepository;
        this.userRepository  = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffDTO> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(StaffMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public StaffDTO createStaff(StaffRequestDTO request) {
        String username = resolveUsername(request);

        // FIX [M4]: Gunakan existsByUsername() — lebih efisien
        if (userRepository.existsByUsername(username)) {
            throw new BadRequestException("Username '" + username + "' sudah digunakan");
        }

        Staff staff = new Staff();
        staff.setUsername(username);
        staff.setEmail(resolveEmail(request, username));
        applyRequest(staff, request);

        String rawPassword = (request.getPassword() == null || request.getPassword().isBlank())
                ? "staff123"
                : request.getPassword();
        staff.setPassword(passwordEncoder.encode(rawPassword));

        return StaffMapper.toDTO(staffRepository.save(staff));
    }

    @Override
    public StaffDTO updateStaff(Long id, StaffRequestDTO request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff tidak ditemukan dengan id: " + id));

        // FIX [M2]: Cek duplikasi username saat update jika username berubah
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim().toLowerCase();
            if (!newUsername.equals(staff.getUsername()) && userRepository.existsByUsername(newUsername)) {
                throw new BadRequestException("Username '" + newUsername + "' sudah digunakan oleh user lain");
            }
        }

        applyRequest(staff, request);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            staff.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return StaffMapper.toDTO(staffRepository.save(staff));
    }

    @Override
    public void deleteStaff(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new ResourceNotFoundException("Staff tidak ditemukan dengan id: " + id);
        }
        staffRepository.deleteById(id);
    }

    private void applyRequest(Staff staff, StaffRequestDTO request) {
        if (request.getName()       != null)                          staff.setName(request.getName());
        if (request.getUsername()   != null && !request.getUsername().isBlank())
            staff.setUsername(request.getUsername().trim().toLowerCase());
        if (request.getEmail()      != null && !request.getEmail().isBlank()) staff.setEmail(request.getEmail().trim());
        if (request.getPhone()      != null)                          staff.setPhone(request.getPhone());
        if (request.getDepartment() != null)                          staff.setDepartment(request.getDepartment());
        if (request.getPosition()   != null)                          staff.setPosition(request.getPosition());
        if (request.getStatus()     != null)                          staff.setStatus(request.getStatus());
    }

    private String resolveUsername(StaffRequestDTO request) {
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            return request.getUsername().trim().toLowerCase();
        }
        if (request.getName() == null || request.getName().isBlank()) {
            throw new BadRequestException("Nama staff wajib diisi");
        }
        String base = request.getName().trim().toLowerCase().replaceAll("[^a-z0-9]+", ".");
        String candidate = base;
        int suffix = 1;
        // FIX [M4]: Gunakan existsByUsername() — lebih efisien dari findByUsername()
        while (userRepository.existsByUsername(candidate)) {
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