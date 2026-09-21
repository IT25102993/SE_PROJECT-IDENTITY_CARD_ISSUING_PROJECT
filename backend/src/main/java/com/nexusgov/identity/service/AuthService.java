package com.nexusgov.identity.service;

import com.nexusgov.identity.dto.AuthDtos;
import com.nexusgov.identity.model.AuditLog;
import com.nexusgov.identity.model.User;
import com.nexusgov.identity.repository.AuditLogRepository;
import com.nexusgov.identity.repository.UserRepository;
import com.nexusgov.identity.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Auth service — handles registration, login, OTP orchestration, and user management.
 * This is the Java equivalent of authController.js.
 */
@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final OtpService otpService;
    private final EmailService emailService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       AuditLogRepository auditLogRepository,
                       OtpService otpService,
                       EmailService emailService,
                       JwtUtil jwtUtil,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.auditLogRepository = auditLogRepository;
        this.otpService = otpService;
        this.emailService = emailService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // ── Password Validation ──────────────────────────────────────────────────

    /**
     * Validate password strength:
     * - At least 8 characters
     * - At least 1 uppercase letter
     * - At least 1 special character
     */
    public String validatePassword(String password) {
        if (password == null || password.length() < 8) {
            return "Password must be at least 8 characters long.";
        }
        if (!password.matches(".*[A-Z].*")) {
            return "Password must contain at least one uppercase letter.";
        }
        if (!password.matches(".*[^A-Za-z0-9].*")) {
            return "Password must contain at least one special character (e.g. !@#$%).";
        }
        return null; // valid
    }

    // ── OTP: Send ────────────────────────────────────────────────────────────

    public record OtpSendResult(boolean success, String message, String devOtp) {}

    public OtpSendResult sendOtp(String email, String fullName) {
        // Check if email already registered
        if (userRepository.existsByEmail(email)) {
            return new OtpSendResult(false, "This email is already registered.", null);
        }

        String otp = otpService.generateAndStore(email, fullName);

        try {
            emailService.sendOtpEmail(email, otp, fullName != null ? fullName : "User");
            return new OtpSendResult(true,
                "Verification code sent to " + email + ". Please check your inbox.", null);
        } catch (Exception e) {
            log.warn("⚠️ Mailer SMTP note (using Dev OTP fallback): {}", e.getMessage());
            log.info("🔑 DEMO MODE OTP for {}: {}", email, otp);
            return new OtpSendResult(true,
                "Verification code generated! (Code: " + otp + ")", otp);
        }
    }

    // ── OTP: Verify ──────────────────────────────────────────────────────────

    public record OtpVerifyResult(boolean success, String message) {}

    public OtpVerifyResult verifyOtp(String email, String otp) {
        return switch (otpService.verify(email, otp)) {
            case NOT_FOUND -> new OtpVerifyResult(false,
                "No OTP found for this email. Please request a new one.");
            case EXPIRED   -> new OtpVerifyResult(false,
                "OTP has expired. Please request a new code.");
            case INVALID   -> new OtpVerifyResult(false,
                "Invalid OTP. Please check and try again.");
            case OK        -> new OtpVerifyResult(true, "OTP verified successfully.");
        };
    }

    // ── Register ─────────────────────────────────────────────────────────────

    public record RegisterResult(boolean success, String message, String token, AuthDtos.UserDto user) {}

    @Transactional
    public RegisterResult register(AuthDtos.RegisterRequest req) {
        if (req.getUsername() == null || req.getEmail() == null ||
            req.getPassword() == null || req.getFull_name() == null) {
            return new RegisterResult(false,
                "Please provide all required fields: username, email, password, and full name.", null, null);
        }

        String pwdError = validatePassword(req.getPassword());
        if (pwdError != null) {
            return new RegisterResult(false, pwdError, null, null);
        }

        // OTP verification gate — if OTP was sent but not verified, block
        if (otpService.hasPendingUnverified(req.getEmail())) {
            return new RegisterResult(false,
                "Email not verified. Please complete OTP verification before registering.", null, null);
        }

        if (userRepository.existsByUsernameOrEmail(req.getUsername(), req.getEmail())) {
            return new RegisterResult(false,
                "Username or Email address is already registered.", null, null);
        }

        String validRole = "Citizen";

        User user = User.builder()
            .username(req.getUsername())
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .fullName(req.getFull_name())
            .role(User.UserRole.valueOf(validRole))
            .build();

        user = userRepository.save(user);

        // Audit log
        auditLogRepository.save(AuditLog.builder()
            .user(user)
            .action("USER_REGISTER")
            .details("New user registered: " + user.getUsername() + " (" + validRole + ")")
            .build());

        // Clear OTP store
        otpService.remove(req.getEmail());

        String token = jwtUtil.generateToken(
            user.getUserId(), user.getUsername(), user.getEmail(),
            user.getRole().name(), user.getFullName()
        );

        return new RegisterResult(true, "Account registered successfully!", token, toDto(user));
    }

    // ── Register Staff (Admin) ────────────────────────────────────────────────

    @Transactional
    public RegisterResult registerStaff(AuthDtos.RegisterStaffRequest req, User adminUser) {
        if (userRepository.existsByUsernameOrEmail(req.getUsername(), req.getEmail())) {
            return new RegisterResult(false, "Username or Email is already registered.", null, null);
        }

        String role = req.getRole();
        boolean validStaffRole = role != null && List.of("Admin", "Form-Officer", "Document-Officer", "Approver", "Operational").contains(role);
        if (!validStaffRole) {
            return new RegisterResult(false,
                "Invalid staff role. Admin, Form-Officer, Document-Officer, Approver, and Operational roles are the only roles that can be registered by an Admin.",
                null, null);
        }

        User user = User.builder()
            .username(req.getUsername())
            .email(req.getEmail())
            .passwordHash(passwordEncoder.encode(req.getPassword()))
            .fullName(req.getFull_name())
            .role(parseRole(role))
            .build();

        user = userRepository.save(user);

        auditLogRepository.save(AuditLog.builder()
            .user(adminUser)
            .action("ADMIN_CREATE_USER")
            .details("Admin created staff user: " + user.getUsername() + " (" + role + ")")
            .build());

        return new RegisterResult(true,
            "Successfully registered new staff member: " + user.getFullName() + " (" + role + ")",
            null, toDto(user));
    }

    // ── Login ────────────────────────────────────────────────────────────────

    public record LoginResult(boolean success, String message, String token, AuthDtos.UserDto user) {}

    public LoginResult login(String usernameOrEmail, String password) {
        Optional<User> userOpt = userRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail);

        if (userOpt.isEmpty()) {
            return new LoginResult(false, "Invalid credentials. User not found.", null, null);
        }

        User user = userOpt.get();

        // Allow bcrypt check AND demo passwords (same logic as Node.js)
        boolean isMatch = false;
        try {
            isMatch = passwordEncoder.matches(password, user.getPasswordHash());
        } catch (Exception ignored) {}

        // Demo fallback passwords (matching Node.js authController.js)
        if (!isMatch && (password.equals("password123") || password.equals("admin123") || password.equals("#Thilina2005"))) {
            isMatch = true;
        }

        if (!isMatch) {
            return new LoginResult(false, "Invalid credentials. Password incorrect.", null, null);
        }

        String token = jwtUtil.generateToken(
            user.getUserId(), user.getUsername(), user.getEmail(),
            user.getRole().name(), user.getFullName()
        );

        auditLogRepository.save(AuditLog.builder()
            .user(user)
            .action("USER_LOGIN")
            .details("User " + user.getUsername() + " logged in successfully.")
            .build());

        return new LoginResult(true, "Logged in successfully!", token, toDto(user));
    }

    // ── Get All Users ─────────────────────────────────────────────────────────

    public List<AuthDtos.UserDto> getAllUsers() {
        return userRepository.findAll().stream()
            .sorted((a, b) -> Long.compare(b.getUserId(), a.getUserId()))
            .map(this::toDto)
            .toList();
    }

    // ── Update User ───────────────────────────────────────────────────────────

    @Transactional
    public String updateUser(Long id, AuthDtos.UpdateUserRequest req) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found: " + id));

        if (req.getFull_name() != null) user.setFullName(req.getFull_name());
        if (req.getEmail() != null) user.setEmail(req.getEmail());
        if (req.getRole() != null) user.setRole(parseRole(req.getRole()));

        userRepository.save(user);
        return "User #" + id + " updated successfully.";
    }

    // ── Delete User ───────────────────────────────────────────────────────────

    @Transactional
    public String deleteUser(Long id) {
        userRepository.deleteById(id);
        return "User #" + id + " deleted successfully.";
    }

    // ── Helper: Entity → DTO ──────────────────────────────────────────────────

    /**
     * Map a role string to the matching enum constant.
     * Accepts 'Form-Officer', 'DOCUMENT_OFFICER', 'Admin', 'APPROVER', etc.
     */
    private static User.UserRole parseRole(String role) {
        if (role == null) {
            throw new IllegalArgumentException("Role must not be null.");
        }
        // Match DB values ("Form-Officer") and enum constant names case-insensitively,
        // so Admin/Approver/Operational/Citizen (mixed-case names) resolve correctly.
        String target = role.replace('_', '-');
        for (User.UserRole r : User.UserRole.values()) {
            if (r.dbValue().equalsIgnoreCase(target) || r.name().equalsIgnoreCase(role)) {
                return r;
            }
        }
        throw new IllegalArgumentException("Unknown role: " + role);
    }

    public AuthDtos.UserDto toDto(User user) {
        AuthDtos.UserDto dto = new AuthDtos.UserDto();
        dto.setUser_id(user.getUserId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFull_name(user.getFullName());
        dto.setRole(user.getRole() != null ? user.getRole().dbValue() : null);
        dto.setCreated_at(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null);
        return dto;
    }
}
