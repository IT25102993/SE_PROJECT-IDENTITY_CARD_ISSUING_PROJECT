package com.nexusgov.identity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

public class AuthDtos {

    @Data
    public static class LoginRequest {
        @NotBlank(message = "Username or email is required")
        private String usernameOrEmail;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data
    public static class RegisterRequest {
        @NotBlank(message = "Username is required")
        private String username;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        @NotBlank(message = "Full name is required")
        private String full_name;

        private String role = "Officer";
    }

    @Data
    public static class RegisterStaffRequest {
        @NotBlank private String username;
        @NotBlank @Email private String email;
        @NotBlank private String password;
        @NotBlank private String full_name;
        @NotBlank private String role;
    }

    @Data
    public static class OtpRequest {
        @NotBlank(message = "Email is required")
        @Email
        private String email;

        private String full_name;
    }

    @Data
    public static class VerifyOtpRequest {
        @NotBlank private String email;
        @NotBlank private String otp;
    }

    @Data
    public static class UpdateUserRequest {
        private String full_name;
        private String email;
        private String role;
    }

    @Data
    public static class UserDto {
        private Long user_id;
        private String username;
        private String email;
        private String full_name;
        private String role;
        private String created_at;
    }

    @Data
    public static class AuthResponse {
        private boolean success;
        private String message;
        private String token;
        private UserDto user;
    }
}
