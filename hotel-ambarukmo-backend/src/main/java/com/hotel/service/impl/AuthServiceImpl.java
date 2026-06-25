package com.hotel.service.impl;

import com.hotel.abstracts.User;
import com.hotel.dto.*;
import com.hotel.entity.Guest;
import com.hotel.exception.BadRequestException;
import com.hotel.exception.ResourceNotFoundException;
import com.hotel.exception.UnauthorizedException;
import com.hotel.mapper.UserMapper;
import com.hotel.repository.UserRepository;
import com.hotel.security.JwtService;
import com.hotel.service.interfaces.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
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
        User user = userRepository.findByUsername(request.getUsername());
        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }
        return buildAuthResponse(user);
    }

    @Override
    public AuthResponseDTO registerGuest(RegisterRequestDTO request) {
        if (userRepository.findByUsername(request.getUsername()) != null) {
            throw new BadRequestException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()) != null) {
            throw new BadRequestException("Email already registered");
        }

        Guest guest = new Guest();
        guest.setUsername(request.getUsername());
        guest.setPassword(passwordEncoder.encode(request.getPassword()));
        guest.setName(request.getName());
        guest.setEmail(request.getEmail());
        guest.setPhone(request.getPhone());

        Guest savedGuest = userRepository.save(guest);
        return buildAuthResponse(savedGuest);
    }

    @Override
    public AuthResponseDTO refreshToken(RefreshTokenRequestDTO request) {
        String username = jwtService.refreshAccessToken(request.getRefreshToken());
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UnauthorizedException("User not found");
        }

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
        User user = userRepository.findByEmail(request.getEmail());
        if (user == null) {
            throw new ResourceNotFoundException("Email not found in our system");
        }
        // Demo mode: password reset link simulation only
    }

    @Override
    public void changePassword(String username, ChangePasswordRequestDTO request) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    public UserDTO getProfile(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
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
