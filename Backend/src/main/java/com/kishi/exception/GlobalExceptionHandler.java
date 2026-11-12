package com.kishi.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.kishi.dto.AuthResponse;
import com.kishi.dto.ErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(EmailAlreadyExistsException.class)
        public ResponseEntity<AuthResponse> handleEmailAlreadyExists(
            EmailAlreadyExistsException exception) {

                AuthResponse response =
                        new AuthResponse(exception.getMessage(), null);

                        return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(response);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ErrorResponse> handleValidationErrors(
                MethodArgumentNotValidException exception) {

            String message =
                    exception.getBindingResult()
                            .getFieldErrors()
                            .stream()
                            .map(error -> error.getDefaultMessage())
                            .findFirst()
                            .orElse("Invalid request");

            ErrorResponse response =
                    new ErrorResponse(message);

            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(response);
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFound(
                ResourceNotFoundException exception) {

            ErrorResponse response =
                    new ErrorResponse(exception.getMessage());

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(response);
        }

        @ExceptionHandler(VaultVerifierAlreadyExistsException.class)
        public ResponseEntity<ErrorResponse> handleVaultVerifierAlreadyExists(
                VaultVerifierAlreadyExistsException exception) {

            ErrorResponse response =
                    new ErrorResponse(exception.getMessage());

            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(response);
        }

        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ErrorResponse> handleAuthenticationException(
                AuthenticationException exception) {

            ErrorResponse response =
                    new ErrorResponse("Invalid email or password");

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(response);
        }

        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(
                Exception exception) {

            ErrorResponse response =
                    new ErrorResponse("An unexpected error occurred");

            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(response);
        }

        
}