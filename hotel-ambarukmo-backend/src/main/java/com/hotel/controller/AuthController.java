package com.hotel.controller;

import com.hotel.dto.*;
import com.hotel.service.interfaces.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.hotel.abstracts.controller.BaseController;
import com.hotel.abstracts.dto.BaseResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController extends BaseController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<BaseResponse<AuthResponseDTO>> login(@Valid @RequestBody AuthRequestDTO request) {
        return successResponse(authService.login(request), "Login successful");
    }

    @PostMapping("/register")
    public ResponseEntity<BaseResponse<AuthResponseDTO>> register(@Valid @RequestBody RegisterRequestDTO request) {
        return successResponse(authService.registerGuest(request), "Registration successful", HttpStatus.CREATED);
    }

    @PostMapping("/refresh")
    public ResponseEntity<BaseResponse<AuthResponseDTO>> refresh(@Valid @RequestBody RefreshTokenRequestDTO request) {
        return successResponse(authService.refreshToken(request), "Token refreshed");
    }

    @PostMapping("/logout")
    public ResponseEntity<BaseResponse<Void>> logout(@RequestBody(required = false) RefreshTokenRequestDTO request) {
        if (request != null && request.getRefreshToken() != null) {
            authService.logout(request);
        }
        return successResponse(null, "Logout successful");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<BaseResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequestDTO request) {
        authService.forgotPassword(request);
        return successResponse(null, "Password reset link has been sent to your email");
    }

    @PutMapping("/change-password")
    public ResponseEntity<BaseResponse<Void>> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequestDTO request
    ) {
        authService.changePassword(authentication.getName(), request);
        return successResponse(null, "Password changed successfully");
    }

    @GetMapping("/me")
    public ResponseEntity<BaseResponse<UserDTO>> getProfile(Authentication authentication) {
        return successResponse(authService.getProfile(authentication.getName()));
    }
}
