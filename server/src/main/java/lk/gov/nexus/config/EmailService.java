package lk.gov.nexus.config;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUser;

    @Async
    public void sendOtpEmail(String toEmail, String otp, String fullName) {
        String name = (fullName != null && !fullName.trim().isEmpty()) ? fullName : "Form Officer";
        System.out.println("[OTP] Generated verification code for " + toEmail + ": " + otp);

        if (mailSender == null || mailUser == null || mailUser.trim().isEmpty()) {
            System.out.println("[MAIL NOTE] SMTP credentials not fully configured. Active OTP for " + toEmail + ": " + otp);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailUser, "NexusGov Identity System");
            helper.setTo(toEmail);
            helper.setSubject("NexusGov — Your OTP Verification Code");

            String html = "<!DOCTYPE html>"
                    + "<html lang=\"en\">"
                    + "<head><meta charset=\"UTF-8\"/><title>OTP Verification</title></head>"
                    + "<body style=\"margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;\">"
                    + "  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#0f172a;padding:40px 20px;\">"
                    + "    <tr><td align=\"center\">"
                    + "      <table width=\"520\" cellpadding=\"0\" cellspacing=\"0\" style=\"background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;\">"
                    + "        <tr><td align=\"center\" style=\"background:linear-gradient(135deg,#10b981,#3b82f6);padding:32px 40px;\">"
                    + "          <h1 style=\"margin:0;color:#ffffff;font-size:22px;font-weight:800;\">NexusGov Identity System</h1>"
                    + "          <p style=\"margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;\">Department of Registration of Persons — Sri Lanka</p>"
                    + "        </td></tr>"
                    + "        <tr><td style=\"padding:36px 40px;\">"
                    + "          <p style=\"margin:0 0 16px;color:#ffffff;font-size:15px;\">Hello <strong style=\"color:#ffffff;\">" + name + "</strong>,</p>"
                    + "          <p style=\"margin:0 0 28px;color:#ffffff;font-size:14px;line-height:1.6;\">Your One-Time Password (OTP) for account registration is:</p>"
                    + "          <div align=\"center\" style=\"background:#ffffff;border:2px solid #00ccff;border-radius:12px;padding:24px 32px;margin:0 0 28px;letter-spacing:12px;\">"
                    + "            <span style=\"font-size:42px;font-weight:900;color:#000000;font-family:'Courier New',monospace;\">" + otp + "</span>"
                    + "          </div>"
                    + "          <p style=\"margin:0 0 8px;color:#ffffff;font-size:13px;text-align:center;\">⏱ This code expires in <strong style=\"color:#f59e0b;\">10 minutes</strong>.</p>"
                    + "          <p style=\"margin:0 0 28px;color:#ffffff;font-size:12px;text-align:center;\">Do not share this code with anyone. NexusGov staff will never ask for your OTP.</p>"
                    + "          <hr style=\"border:none;border-top:1px solid #334155;margin:0 0 24px;\" />"
                    + "          <p style=\"margin:0;color:#ffffff;font-size:12px;text-align:center;\">&copy; 2026 NexusGov — Sri Lanka Identity Management System</p>"
                    + "        </td></tr>"
                    + "      </table>"
                    + "    </td></tr>"
                    + "  </table>"
                    + "</body>"
                    + "</html>";

            helper.setText(html, true);
            mailSender.send(message);
            System.out.println("[MAILER] OTP email successfully dispatched to " + toEmail);
        } catch (Exception e) {
            System.out.println("[MAIL NOTE] SMTP dispatch note for " + toEmail + ": " + e.getMessage());
            System.out.println("[OTP FALLBACK] Active OTP for " + toEmail + ": " + otp);
        }
    }
}
