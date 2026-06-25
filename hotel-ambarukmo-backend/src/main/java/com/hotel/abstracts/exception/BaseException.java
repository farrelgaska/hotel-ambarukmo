package com.hotel.abstracts.exception;

import org.springframework.http.HttpStatus;

/**
 * BaseException abstract class demonstrating Abstraction in error handling.
 * All custom exceptions in this project should inherit from this class to ensure
 * consistency in error responses (always providing an HTTP status code).
 */
public abstract class BaseException extends RuntimeException {

    public BaseException(String message) {
        super(message);
    }

    public BaseException(String message, Throwable cause) {
        super(message, cause);
    }

    /**
     * Abstract method to enforce child classes to define their HTTP Status code.
     * Demonstrates Polymorphism.
     * @return HttpStatus
     */
    public abstract HttpStatus getHttpStatus();
}
