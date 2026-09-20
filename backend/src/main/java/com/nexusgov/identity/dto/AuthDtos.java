package com.nexusgov.identity.dto;

/**
 * All authentication-related DTOs — matching the Node.js request/response shapes.
 */
public class AuthDtos {

    public static class LoginRequest {
        private String usernameOrEmail;
        private String password;

        public LoginRequest() {}
        public LoginRequest(String usernameOrEmail, String password) {
            this.usernameOrEmail = usernameOrEmail;
            this.password = password;
        }

        public String getUsernameOrEmail() { return usernameOrEmail; }
        public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        private String username;
        private String email;
        private String password;
        private String full_name;
        private String role = "Form-Officer";

        public RegisterRequest() {}

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFull_name() { return full_name; }
        public void setFull_name(String full_name) { this.full_name = full_name; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class RegisterStaffRequest {
        private String username;
        private String email;
        private String password;
        private String full_name;
        private String role;

        public RegisterStaffRequest() {}

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getFull_name() { return full_name; }
        public void setFull_name(String full_name) { this.full_name = full_name; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class OtpRequest {
        private String email;
        private String full_name;

        public OtpRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFull_name() { return full_name; }
        public void setFull_name(String full_name) { this.full_name = full_name; }
    }

    public static class VerifyOtpRequest {
        private String email;
        private String otp;

        public VerifyOtpRequest() {}

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getOtp() { return otp; }
        public void setOtp(String otp) { this.otp = otp; }
    }

    public static class UpdateUserRequest {
        private String full_name;
        private String email;
        private String role;

        public UpdateUserRequest() {}

        public String getFull_name() { return full_name; }
        public void setFull_name(String full_name) { this.full_name = full_name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
    }

    public static class UserDto {
        private Long user_id;
        private String username;
        private String email;
        private String full_name;
        private String role;
        private String created_at;

        public UserDto() {}
        public UserDto(Long user_id, String username, String email, String full_name, String role, String created_at) {
            this.user_id = user_id;
            this.username = username;
            this.email = email;
            this.full_name = full_name;
            this.role = role;
            this.created_at = created_at;
        }

        public Long getUser_id() { return user_id; }
        public void setUser_id(Long user_id) { this.user_id = user_id; }
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFull_name() { return full_name; }
        public void setFull_name(String full_name) { this.full_name = full_name; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getCreated_at() { return created_at; }
        public void setCreated_at(String created_at) { this.created_at = created_at; }
    }

    public static class AuthResponse {
        private boolean success;
        private String message;
        private String token;
        private UserDto user;

        public AuthResponse() {}
        public AuthResponse(boolean success, String message, String token, UserDto user) {
            this.success = success;
            this.message = message;
            this.token = token;
            this.user = user;
        }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }
        public UserDto getUser() { return user; }
        public void setUser(UserDto user) { this.user = user; }
    }
}
