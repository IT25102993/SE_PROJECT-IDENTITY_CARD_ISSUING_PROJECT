package com.nexusgov.identity.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Email service — sends OTP emails via JavaMailSender (Gmail SMTP).
 * Mirrors Node.js sendOtpEmail in mailer.js.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send an OTP verification email with HTML styling.
     */
    public void sendOtpEmail(String toEmail, String otp, String fullName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("NexusGov Identity System <nexus.government.id.card@gmail.com>");
            helper.setTo(toEmail);
            helper.setSubject("NexusGov — Your Verification Code");

            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background: #0a0a1a; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background: linear-gradient(135deg, #1a1a3e, #0d1b2a); border-radius: 16px; border: 1px solid rgba(99,102,241,0.3); overflow: hidden; }
                    .header { background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 32px; text-align: center; }
                    .header h1 { color: white; margin: 0; font-size: 28px; letter-spacing: 2px; }
                    .header p { color: rgba(255,255,255,0.8); margin: 8px 0 0; }
                    .body { padding: 40px 32px; }
                    .greeting { color: #e2e8f0; font-size: 18px; margin-bottom: 16px; }
                    .otp-box { background: rgba(79,70,229,0.15); border: 2px solid rgba(99,102,241,0.5); border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
                    .otp-code { font-size: 48px; font-weight: 800; letter-spacing: 12px; color: #818cf8; font-family: 'Courier New', monospace; }
                    .note { color: #94a3b8; font-size: 14px; margin-top: 24px; }
                    .footer { background: rgba(0,0,0,0.3); padding: 20px 32px; text-align: center; color: #475569; font-size: 12px; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <div class="header">
                      <h1>🏛 NexusGov</h1>
                      <p>Identity Card Issuing System — Sri Lanka</p>
                    </div>
                    <div class="body">
                      <p class="greeting">Hello, <strong style="color:#818cf8">%s</strong>!</p>
                      <p style="color:#cbd5e1">Your one-time verification code is:</p>
                      <div class="otp-box">
                        <div class="otp-code">%s</div>
                        <p style="color:#64748b;margin:8px 0 0;font-size:13px">Valid for 10 minutes</p>
                      </div>
                      <p class="note">If you did not request this code, please ignore this email. Do not share this code with anyone.</p>
                    </div>
                    <div class="footer">
                      © 2026 NexusGov Identity Card System &nbsp;|&nbsp; Sri Lanka
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(fullName, otp);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("✅ OTP email sent to {}", toEmail);

        } catch (Exception e) {
            log.warn("⚠️ Failed to send OTP email to {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Email send failed: " + e.getMessage(), e);
        }
    }
}
