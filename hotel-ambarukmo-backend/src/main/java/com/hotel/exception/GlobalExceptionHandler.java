package com.hotel.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.hotel.abstracts.dto.BaseResponse;

import java.util.stream.Collectors;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(com.hotel.abstracts.exception.BaseException.class)
    public ResponseEntity<BaseResponse<Void>> baseExceptionHandler(com.hotel.abstracts.exception.BaseException ex) {
        return new ResponseEntity<>(BaseResponse.error(ex.getMessage()), ex.getHttpStatus());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse<Void>> validationExceptionHandler(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return new ResponseEntity<>(BaseResponse.error(message), HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<BaseResponse<Void>> illegalStateException(IllegalStateException ex) {
        return new ResponseEntity<>(BaseResponse.error(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse<Void>> globalExceptionHandler(Exception ex) {
        return new ResponseEntity<>(BaseResponse.error("Terjadi kesalahan pada server: " + ex.getMessage()), HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
