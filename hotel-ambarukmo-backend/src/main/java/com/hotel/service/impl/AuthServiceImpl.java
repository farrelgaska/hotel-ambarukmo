package com.hotel.service.impl;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.hotel.abstracts.User;
import com.hotel.dto.AuthRequestDTO;
import com.hotel.dto.AuthResponseDTO;
import com.hotel.dto.ChangePasswordRequestDTO;
import com.hotel.dto.ForgotPasswordRequestDTO;
import com.hotel.dto.RefreshTokenRequestDTO;
import com.hotel.dto.RegisterRequestDTO;
import com.hotel.dto.UserDTO;
import com.hotel.entity.Guest;
import com.hotel.exception.BadRequestException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.exception.UnauthorizedException;
import com.hotel.mapper.UserMapper;
import com.hotel.repository.UserRepository;
import com.hotel.security.JwtService;
import com.hotel.service.interfaces.AuthService;

/**
 * AuthServiceImpl
 *
 * FIX [M4]: Diupdate untuk menggunakan Optional<User> dari UserRepository.
 * Menggantikan pola "findByX() lalu cek null" dengan Optional API yang lebih aman.
 */
@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponseDTO login(AuthRequestDTO request) {
        // FIX [M4]: Gunakan Optional — tidak ada lagi null check manual
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponseDTO registerGuest(RegisterRequestDTO request) {
        // FIX [M4]: Gunakan existsByX() — lebih efisien, tidak perlu load entitas
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username sudah digunakan");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email sudah terdaftar");
        }

        Guest guest = new Guest();
        guest.setUsername(request.getUsername());
        guest.setPassword(passwordEncoder.encode(request.getPassword()));
        guest.setName(request.getName());
        guest.setEmail(request.getEmail());
        guest.setPhone(request.getPhone());

        Guest savedGuest = (Guest) userRepository.save(guest);
        return buildAuthResponse(savedGuest);
    }

    @Override
    public AuthResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        String username = jwtService.refreshAccessToken(request.getRefreshToken());

        // FIX [M4]: Gunakan Optional
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("User tidak ditemukan"));

        jwtService.invalidateRefreshToken(request.getRefreshToken());
        String newAccessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole());
        String newRefreshToken = jwtService.generateRefreshToken(user.getUsername());

        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(newAccessToken);
        response.setRefreshToken(newRefreshToken);
        response.setUser(UserMapper.toDTO(user));
        return response;
    }

    @Override
    public void logout(RefreshTokenRequestDTO request) {
        jwtService.invalidateRefreshToken(request.getRefreshToken());
    }

    @Override
    public void forgotPassword(ForgotPasswordRequestDTO request) {
        // FIX [M4]: Gunakan Optional
        userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Email tidak ditemukan di sistem kami"));
        // Demo mode: password reset link simulation only
        // TODO: Integrate dengan email service (Spring Mail / SendGrid)
    }

    @Override
    public void changePassword(String username, ChangePasswordRequestDTO request) {
        // FIX [M4]: Gunakan Optional
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Password lama tidak sesuai");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserDTO getProfile(String username) {
        // FIX [M4]: Gunakan Optional
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));
        return UserMapper.toDTO(user);
    }

    private AuthResponseDTO buildAuthResponse(User user) {
        String accessToken = jwtService.generateAccessToken(user.getUsername(), user.getRole());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(accessToken);
        response.setRefreshToken(refreshToken);
        response.setUser(UserMapper.toDTO(user));
        return response;
    }
}