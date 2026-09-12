package com.nexusgov.identity.dto;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * All authentication-related DTOs — matching the Node.js request/response shapes.
 * Using explicit @Getter/@Setter for Java 24 Lombok compatibility.
 */
public class AuthDtos {

    @Getter
    @Setter
    @NoArgsConstructor
    public static class LoginRequest {
        private String usernameOrEmail;
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String full_name;
        private String role = "Officer";
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class RegisterStaffRequest {
        private String username;
        private String email;
        private String password;
        private String full_name;
        private String role;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class OtpRequest {
        private String email;
        private String full_name;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    public static class UpdateUserRequest {
        private String full_name;
        private String email;
        private String role;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDto {
        private Long user_id;
        private String username;
        private String email;
        private String full_name;
        private String role;
        private String created_at;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private boolean success;
        private String message;
        private String token;
        private UserDto user;
    }
}
