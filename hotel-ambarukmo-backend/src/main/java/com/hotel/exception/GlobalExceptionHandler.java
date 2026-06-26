package com.hotel.exception;

import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.hotel.abstracts.dto.BaseResponse;

/**
 * GlobalExceptionHandler — Menangani semua exception dan mengubahnya jadi JSON response.
 *
 * FIX [M5]: Ditambahkan handler untuk:
 *  - AccessDeniedException (403 Forbidden) — sebelumnya mengembalikan HTML Spring default
 *  - AuthenticationException (401 Unauthorized) — konsisten JSON
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Handle semua custom exception turunan BaseException.
     * Mencakup: ResourceNotFoundException (404), BadRequestException (400), UnauthorizedException (401)
     */
    @ExceptionHandler(com.hotel.abstracts.exception.BaseException.class)
    public ResponseEntity<BaseResponse<Void>> baseExceptionHandler(com.hotel.abstracts.exception.BaseException ex) {
        return new ResponseEntity<>(BaseResponse.error(ex.getMessage()), ex.getHttpStatus());
    }

    /**
     * FIX [M5]: Handle 403 Forbidden — sebelumnya mengembalikan HTML dari Spring Security.
     * Sekarang mengembalikan JSON konsisten.
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<BaseResponse<Void>> accessDeniedHandler(AccessDeniedException ex) {
        return new ResponseEntity<>(
            BaseResponse.error("Forbidden: Anda tidak memiliki hak akses ke resource ini."),
            HttpStatus.FORBIDDEN
        );
    }

    /**
     * FIX: Handle 401 Unauthorized dari Spring Security (token invalid/expired saat filter).
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<BaseResponse<Void>> authenticationExceptionHandler(AuthenticationException ex) {
        return new ResponseEntity<>(
            BaseResponse.error("Unauthorized: " + ex.getMessage()),
            HttpStatus.UNAUTHORIZED
        );
    }

    /**
     * Handle Bean Validation errors (@Valid).
     * Menggabungkan semua pesan validasi menjadi satu string.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse<Void>> validationExceptionHandler(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return new ResponseEntity<>(BaseResponse.error(message), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle IllegalStateException (business rule violations).
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<BaseResponse<Void>> illegalStateException(IllegalStateException ex) {
        return new ResponseEntity<>(BaseResponse.error(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle IllegalArgumentException (invalid arguments).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<BaseResponse<Void>> illegalArgumentException(IllegalArgumentException ex) {
        return new ResponseEntity<>(BaseResponse.error(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    /**
     * Global catch-all — jangan expose internal error message di production.
     * Pertimbangkan menggunakan logging di sini untuk monitoring.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Void>> globalExceptionHandler(Exception ex) {
        // TODO: Di production, gunakan logging dan sembunyikan detail internal
        // log.error("Unhandled exception", ex);
        return new ResponseEntity<>(
            BaseResponse.error("Terjadi kesalahan pada server. Silakan coba lagi."),
            HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}