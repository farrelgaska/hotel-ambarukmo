package com.hotel.abstracts.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * BaseResponse standard REST API wrapper.
 * Ensuring a consistent JSON structure for all API responses.
 * 
 * @param <T> The type of the data payload
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BaseResponse<T> {
    private String status;
    private String message;
    private T data;

    public static <T> BaseResponse<T> success(T data, String message) {
        return new BaseResponse<>("success", message, data);
    }
    
    public static <T> BaseResponse<T> success(T data) {
        return success(data, "Operation successful");
    }

    public static <T> BaseResponse<T> error(String message) {
        return new BaseResponse<>("error", message, null);
    }
}
