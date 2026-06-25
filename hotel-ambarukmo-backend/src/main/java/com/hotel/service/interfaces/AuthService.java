package com.hotel.service.interfaces;

import com.hotel.dto.*;

public interface AuthService {
    AuthResponseDTO login(AuthRequestDTO request);
    AuthResponseDTO registerGuest(RegisterRequestDTO request);
    AuthResponseDTO refreshToken(RefreshTokenRequestDTO request);
    void logout(RefreshTokenRequestDTO request);
    void forgotPassword(ForgotPasswordRequestDTO request);
    void changePassword(String username, ChangePasswordRequestDTO request);
    UserDTO getProfile(String username);
}
