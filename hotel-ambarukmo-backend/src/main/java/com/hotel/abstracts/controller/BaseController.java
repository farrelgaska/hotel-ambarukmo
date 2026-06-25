package com.hotel.abstracts.controller;

import com.hotel.abstracts.dto.BaseResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * BaseController abstract class demonstrating Abstraction for API endpoints.
 * Provides standard methods for constructing successful and error responses.
 */
public abstract class BaseController {

    protected <T> ResponseEntity<BaseResponse<T>> successResponse(T data, HttpStatus status) {
        return new ResponseEntity<>(BaseResponse.success(data), status);
    }

    protected <T> ResponseEntity<BaseResponse<T>> successResponse(T data, String message, HttpStatus status) {
        return new ResponseEntity<>(BaseResponse.success(data, message), status);
    }

    protected <T> ResponseEntity<BaseResponse<T>> successResponse(T data, String message) {
        return successResponse(data, message, HttpStatus.OK);
    }
    protected <T> ResponseEntity<BaseResponse<T>> successResponse(T data) {
        return successResponse(data, HttpStatus.OK);
    }

    protected ResponseEntity<BaseResponse<Void>> noContentResponse() {
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
