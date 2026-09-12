package com.nexusgov.identity.controller;

import com.nexusgov.identity.dto.AuthDtos;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.service.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Auth REST Controller — exposes /api/auth/* endpoints.
 * Mirrors authRoutes.js + authController.js in Node.js.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // ── POST /api/auth/send-otp ───────────────────────────────────────────────

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@RequestBody AuthDtos.OtpRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body(error("Email address is required."));
        }

        AuthService.OtpSendResult result = authService.sendOtp(req.getEmail(), req.getFull_name());

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.devOtp() != null) {
            response.put("devOtp", result.devOtp());
        }

        return result.success()
            ? ResponseEntity.ok(response)
            : ResponseEntity.badRequest().body(response);
    }

    // ── POST /api/auth/verify-otp ─────────────────────────────────────────────

    @PostMapping("/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOtp(@RequestBody AuthDtos.VerifyOtpRequest req) {
        if (req.getEmail() == null || req.getOtp() == null) {
            return ResponseEntity.badRequest().body(error("Email and OTP are required."));
        }

        AuthService.OtpVerifyResult result = authService.verifyOtp(req.getEmail(), req.getOtp());
        Map<String, Object> response = Map.of("success", result.success(), "message", result.message());

        return result.success()
            ? ResponseEntity.ok(response)
            : ResponseEntity.badRequest().body(new HashMap<>(response));
    }

    // ── POST /api/auth/register ───────────────────────────────────────────────

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody AuthDtos.RegisterRequest req) {
        AuthService.RegisterResult result = authService.register(req);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.token() != null) response.put("token", result.token());
        if (result.user() != null) response.put("user", result.user());

        return result.success()
            ? ResponseEntity.status(HttpStatus.CREATED).body(response)
            : ResponseEntity.badRequest().body(response);
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthDtos.LoginRequest req) {
        if (req.getUsernameOrEmail() == null || req.getPassword() == null) {
            return ResponseEntity.badRequest()
                .body(error("Username/Email and Password are required."));
        }

        AuthService.LoginResult result = authService.login(req.getUsernameOrEmail(), req.getPassword());

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.token() != null) response.put("token", result.token());
        if (result.user() != null) response.put("user", result.user());

        return result.success()
            ? ResponseEntity.ok(response)
            : ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal User currentUser) {
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(error("User profile not found."));
        }

        return ResponseEntity.ok(Map.of(
            "success", true,
            "user", authService.toDto(currentUser)
        ));
    }

    // ── POST /api/auth/logout ─────────────────────────────────────────────────

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully."));
    }

    // ── GET /api/auth/users ───────────────────────────────────────────────────

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        List<AuthDtos.UserDto> users = authService.getAllUsers();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "count", users.size(),
            "users", users
        ));
    }

    // ── POST /api/auth/register-staff ─────────────────────────────────────────

    @PostMapping("/register-staff")
    public ResponseEntity<Map<String, Object>> registerStaff(
            @RequestBody AuthDtos.RegisterStaffRequest req,
            @AuthenticationPrincipal User currentUser) {

        AuthService.RegisterResult result = authService.registerStaff(req, currentUser);

        Map<String, Object> response = new HashMap<>();
        response.put("success", result.success());
        response.put("message", result.message());
        if (result.user() != null) response.put("user", result.user());

        return result.success()
            ? ResponseEntity.status(HttpStatus.CREATED).body(response)
            : ResponseEntity.badRequest().body(response);
    }

    // ── PATCH /api/auth/users/:id ─────────────────────────────────────────────

    @PatchMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable Long id,
            @RequestBody AuthDtos.UpdateUserRequest req) {
        try {
            String msg = authService.updateUser(id, req);
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error(e.getMessage()));
        }
    }

    // ── DELETE /api/auth/users/:id ────────────────────────────────────────────

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        try {
            String msg = authService.deleteUser(id);
            return ResponseEntity.ok(Map.of("success", true, "message", msg));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(error(e.getMessage()));
        }
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Map<String, Object> error(String message) {
        Map<String, Object> m = new HashMap<>();
        m.put("success", false);
        m.put("message", message);
        return m;
    }
}
