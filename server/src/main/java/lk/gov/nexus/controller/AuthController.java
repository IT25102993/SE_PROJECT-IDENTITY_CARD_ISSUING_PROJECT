package lk.gov.nexus.controller;

import lk.gov.nexus.config.BackupService;
import lk.gov.nexus.config.EmailService;
import lk.gov.nexus.config.JwtUtil;
import lk.gov.nexus.entity.*;
import lk.gov.nexus.repository.*;
import lk.gov.nexus.util.UserContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ThreadLocalRandom;

@RestController
@RequestMapping({"/api/auth", "/api/users"})
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private ApplicantRepository applicantRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private AccountDeletionRequestRepository deletionRequestRepository;
    @Autowired private AuditLogRepository auditLogRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private EmailService emailService;
    @Autowired private BackupService backupService;

    // In-memory OTP storage: email -> OtpRecord
    private static class OtpRecord {
        String otp;
        long expiresAt;
        String fullName;
        boolean verified;

        OtpRecord(String otp, long expiresAt, String fullName) {
            this.otp = otp;
            this.expiresAt = expiresAt;
            this.fullName = fullName;
            this.verified = false;
        }
    }

    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();

    private String validatePassword(String password) {
        if (password == null || password.length() < 8) {
            return "Password must be at least 8 characters long.";
        }
        if (!password.matches(".*[A-Z].*")) {
            return "Password must contain at least one uppercase letter.";
        }
        if (!password.matches(".*[^A-Za-z0-9].*")) {
            return "Password must contain at least one special character (e.g. !@#$%).";
        }
        return null;
    }

    // ── OTP: Send ─────────────────────────────────────────────────────────────
    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String fullName = body.get("full_name");

        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email address is required."));
        }

        if (userRepository.existsByEmail(email.trim())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "This email is already registered."));
        }

        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));
        long expiresAt = System.currentTimeMillis() + 10 * 60 * 1000; // 10 minutes

        otpStore.put(email.trim(), new OtpRecord(otp, expiresAt, fullName != null ? fullName : "User"));

        // Non-blocking async mail dispatch
        emailService.sendOtpEmail(email.trim(), otp, fullName);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Verification code sent to " + email + ". Please check your inbox."
        ));
    }

    // ── OTP: Verify ───────────────────────────────────────────────────────────
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Email and OTP are required."));
        }

        OtpRecord record = otpStore.get(email.trim());
        if (record == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "No OTP found for this email. Please request a new one."));
        }

        if (System.currentTimeMillis() > record.expiresAt) {
            otpStore.remove(email.trim());
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "OTP has expired. Please request a new code."));
        }

        if (!record.otp.equals(otp.trim())) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Invalid OTP. Please check and try again."));
        }

        record.verified = true;
        return ResponseEntity.ok(Map.of("success", true, "message", "OTP verified successfully."));
    }

    // ── Register Citizen ──────────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        try {
            String username = body.get("username");
            String email = body.get("email");
            String password = body.get("password");
            String fullName = body.get("full_name");

            if (username == null || email == null || password == null || fullName == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Please provide all required fields: username, email, password, and full name."
                ));
            }

            String pwdErr = validatePassword(password);
            if (pwdErr != null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", pwdErr));
            }

            OtpRecord otpRecord = otpStore.get(email.trim());
            if (otpRecord != null && !otpRecord.verified) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Email not verified. Please complete OTP verification before registering."
                ));
            }

            if (userRepository.existsByUsername(username.trim()) || userRepository.existsByEmail(email.trim())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Username or Email address is already registered."
                ));
            }

            User user = new User();
            user.setUsername(username.trim());
            user.setEmail(email.trim());
            user.setFullName(fullName.trim());
            user.setPasswordHash(passwordEncoder.encode(password));
            user.setRole("Citizen");
            user.setCreatedAt(LocalDateTime.now());
            user = userRepository.save(user);

            auditLogRepository.save(new AuditLog(user.getUserId(), "USER_REGISTER", "New citizen registered: " + username + " (Citizen)"));
            backupService.triggerAutoBackup("Citizen registered: " + username);

            otpStore.remove(email.trim());

            String token = jwtUtil.generateToken(user);

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("message", "Account registered successfully!");
            res.put("token", token);
            res.put("user", user);

            return ResponseEntity.status(HttpStatus.CREATED).body(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        try {
            String usernameOrEmail = body.get("usernameOrEmail");
            String password = body.get("password");

            if (usernameOrEmail == null || password == null) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Username/Email and Password are required."));
            }

            Optional<User> userOpt = userRepository.findByUsernameOrEmail(usernameOrEmail.trim(), usernameOrEmail.trim());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid credentials. User not found."));
            }

            User user = userOpt.get();
            boolean isMatch = passwordEncoder.matches(password, user.getPasswordHash());

            // Support default fallback credentials matching Node.js login rules
            if (!isMatch && (
                    password.equals("password123") ||
                            password.equals("admin123") ||
                            password.equals("#Thilina2005") ||
                            password.equals(user.getPasswordHash())
            )) {
                isMatch = true;
            }

            if (!isMatch) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Invalid credentials. Password incorrect."));
            }

            String token = jwtUtil.generateToken(user);
            auditLogRepository.save(new AuditLog(user.getUserId(), "USER_LOGIN", "User " + user.getUsername() + " logged in successfully."));

            Map<String, Object> res = new LinkedHashMap<>();
            res.put("success", true);
            res.put("message", "Logged in successfully!");
            res.put("token", token);
            res.put("user", user);

            return ResponseEntity.ok(res);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ── Get Current User ──────────────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> getMe() {
        Long userId = UserContext.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Unauthorized"));
        }

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User profile not found."));
        }

        return ResponseEntity.ok(Map.of("success", true, "user", userOpt.get()));
    }

    // ── Logout ────────────────────────────────────────────────────────────────
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully."));
    }

    // ── Check Account Deletion Eligibility ────────────────────────────────────
    @GetMapping("/deletion-status")
    public ResponseEntity<?> checkUserDeletionEligibility() {
        User user = UserContext.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Unauthorized"));
        }

        List<Applicant> applicants = applicantRepository.findByEmail(user.getEmail());
        List<Application> userApps = new ArrayList<>();
        if (!applicants.isEmpty()) {
            List<Long> applicantIds = applicants.stream().map(Applicant::getApplicantId).toList();
            userApps = applicationRepository.findByApplicantIdIn(applicantIds);
        }

        Optional<AccountDeletionRequest> pendingOpt = deletionRequestRepository
                .findFirstByEmailAndStatusOrderByRequestedAtDesc(user.getEmail(), "Pending");

        boolean hasApplications = !userApps.isEmpty();

        Map<String, Object> res = new LinkedHashMap<>();
        res.put("success", true);
        res.put("hasApplications", hasApplications);
        res.put("applicationCount", userApps.size());
        res.put("applications", userApps);
        res.put("canDirectDelete", !hasApplications);
        res.put("pendingRequest", pendingOpt.orElse(null));

        return ResponseEntity.ok(res);
    }

    // ── Direct Account Deletion (If No Applications Submitted) ────────────────
    @DeleteMapping("/me")
    public ResponseEntity<?> deleteOwnAccount() {
        User user = UserContext.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Unauthorized"));
        }

        List<Applicant> applicants = applicantRepository.findByEmail(user.getEmail());
        long appCount = 0;
        if (!applicants.isEmpty()) {
            List<Long> ids = applicants.stream().map(Applicant::getApplicantId).toList();
            appCount = applicationRepository.findByApplicantIdIn(ids).size();
        }

        if (appCount > 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "You have submitted applications on file. Please submit an account deletion request for administrative approval."
            ));
        }

        userRepository.deleteById(user.getUserId());
        auditLogRepository.save(new AuditLog(user.getUserId(), "USER_DELETED_OWN_ACCOUNT",
                "User " + user.getUsername() + " (" + user.getEmail() + ") directly deleted their account (0 applications on file)."));
        backupService.triggerAutoBackup("User account deleted: " + user.getUsername());

        return ResponseEntity.ok(Map.of("success", true, "message", "Your account has been deleted successfully."));
    }

    // ── Request Account Deletion (When Applications Exist) ─────────────────────
    @PostMapping("/request-deletion")
    public ResponseEntity<?> requestAccountDeletion(@RequestBody(required = false) Map<String, String> body) {
        User user = UserContext.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("success", false, "message", "Unauthorized"));
        }

        String reason = (body != null && body.get("reason") != null && !body.get("reason").trim().isEmpty())
                ? body.get("reason")
                : "Citizen requested account removal.";

        Optional<AccountDeletionRequest> existing = deletionRequestRepository
                .findFirstByEmailAndStatusOrderByRequestedAtDesc(user.getEmail(), "Pending");

        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "You already have a pending deletion request under administrative review."
            ));
        }

        AccountDeletionRequest req = new AccountDeletionRequest();
        req.setUserId(user.getUserId());
        req.setUsername(user.getUsername());
        req.setEmail(user.getEmail());
        req.setReason(reason);
        req.setStatus("Pending");
        req.setRequestedAt(LocalDateTime.now());
        req = deletionRequestRepository.save(req);

        auditLogRepository.save(new AuditLog(user.getUserId(), "ACCOUNT_DELETION_REQUESTED",
                "User " + user.getUsername() + " requested account deletion. Reason: " + reason));
        backupService.triggerAutoBackup("Account deletion requested: " + user.getUsername());

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Account deletion request submitted successfully. An administrator will review your application status before processing.",
                "requestId", req.getRequestId()
        ));
    }

    // ── Compatibility Fallbacks for User Administration ───────────────────────
    @PostMapping("/register-staff")
    public ResponseEntity<?> registerStaff(@RequestBody Map<String, String> body) {
        // Delegate to Admin logic
        String username = body.get("username");
        String email = body.get("email");
        String password = body.get("password");
        String fullName = body.get("full_name");
        String role = body.get("role");

        if (username == null || email == null || password == null || fullName == null || role == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "All fields are required."));
        }

        User u = new User(username, passwordEncoder.encode(password), fullName, email, role);
        u = userRepository.save(u);
        backupService.triggerAutoBackup("Staff user created: " + username);

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "success", true,
                "message", "Successfully registered new staff member: " + fullName + " (" + role + ")",
                "user", u
        ));
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        List<User> list = userRepository.findAll();
        return ResponseEntity.ok(Map.of("success", true, "count", list.size(), "users", list));
    }

    @RequestMapping(value = "/users/{id}", method = {RequestMethod.PUT, RequestMethod.PATCH})
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Optional<User> uOpt = userRepository.findById(id);
        if (uOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User not found"));
        }
        User u = uOpt.get();
        if (body.get("full_name") != null) u.setFullName(body.get("full_name"));
        if (body.get("email") != null) u.setEmail(body.get("email"));
        if (body.get("role") != null) u.setRole(body.get("role"));
        userRepository.save(u);
        backupService.triggerAutoBackup("User updated: " + u.getUsername());

        return ResponseEntity.ok(Map.of("success", true, "message", "User #" + id + " updated successfully."));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        backupService.triggerAutoBackup("User deleted #" + id);
        return ResponseEntity.ok(Map.of("success", true, "message", "User #" + id + " deleted successfully."));
    }
}
