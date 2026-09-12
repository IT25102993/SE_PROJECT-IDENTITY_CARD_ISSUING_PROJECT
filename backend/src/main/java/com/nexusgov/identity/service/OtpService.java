package com.nexusgov.identity.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory OTP store — mirrors the Node.js otpStore Map.
 * Stores { email -> { otp, expiresAt, fullName, verified } }
 */
@Service
@Slf4j
public class OtpService {

    private record OtpRecord(String otp, long expiresAt, String fullName, boolean verified) {
        OtpRecord withVerified() {
            return new OtpRecord(otp, expiresAt, fullName, true);
        }
    }

    // Thread-safe map
    private final Map<String, OtpRecord> otpStore = new ConcurrentHashMap<>();
    private final Random random = new Random();

    /** OTP validity window: 10 minutes (same as Node.js) */
    private static final long OTP_EXPIRY_MS = 10 * 60 * 1000L;

    // ── Store ────────────────────────────────────────────────────────────────

    public String generateAndStore(String email, String fullName) {
        String otp = String.format("%06d", 100000 + random.nextInt(900000));
        long expiresAt = Instant.now().toEpochMilli() + OTP_EXPIRY_MS;
        otpStore.put(email, new OtpRecord(otp, expiresAt, fullName != null ? fullName : "User", false));
        return otp;
    }

    // ── Verify ───────────────────────────────────────────────────────────────

    public enum VerifyResult { NOT_FOUND, EXPIRED, INVALID, OK }

    public VerifyResult verify(String email, String otp) {
        OtpRecord record = otpStore.get(email);
        if (record == null) return VerifyResult.NOT_FOUND;
        if (Instant.now().toEpochMilli() > record.expiresAt()) {
            otpStore.remove(email);
            return VerifyResult.EXPIRED;
        }
        if (!record.otp().equals(otp.trim())) return VerifyResult.INVALID;

        // Mark as verified
        otpStore.put(email, record.withVerified());
        return VerifyResult.OK;
    }

    // ── Query ────────────────────────────────────────────────────────────────

    public boolean isVerified(String email) {
        OtpRecord record = otpStore.get(email);
        return record != null && record.verified();
    }

    public boolean hasPendingUnverified(String email) {
        OtpRecord record = otpStore.get(email);
        return record != null && !record.verified();
    }

    public void remove(String email) {
        otpStore.remove(email);
    }
}
