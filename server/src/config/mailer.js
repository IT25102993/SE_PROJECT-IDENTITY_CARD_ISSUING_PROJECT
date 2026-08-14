import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/**
 * Send an OTP verification email.
 * @param {string} toEmail  - recipient address
 * @param {string} otp      - 6-digit OTP string
 * @param {string} fullName - recipient's display name
 */
export const sendOtpEmail = async (toEmail, otp, fullName = 'Officer') => {
  const mailOptions = {
    from: `"NexusGov Identity System" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: 'NexusGov — Your OTP Verification Code',
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>OTP Verification</title>
      </head>
      <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
          <tr>
            <td align="center">
              <table width="520" cellpadding="0" cellspacing="0"
                style="background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">

                <!-- Header -->
                <tr>
                  <td align="center"
                    style="background:linear-gradient(135deg,#10b981,#3b82f6);padding:32px 40px;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                      NexusGov Identity System
                    </h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">
                      Department of Registration of Persons — Sri Lanka
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:36px 40px;">
                    <p style="margin:0 0 16px;color:#ffffff;font-size:15px;">
                      Hello <strong style="color:#ffffff;">${fullName}</strong>,
                    </p>
                    <p style="margin:0 0 28px;color:#ffffff;font-size:14px;line-height:1.6;">
                      Your One-Time Password (OTP) for officer account registration is:
                    </p>

                    <!-- OTP Box -->
                    <div align="center"
                      style="background:#ffffff;border:2px solid #00ccff;border-radius:12px;
                             padding:24px 32px;margin:0 0 28px;letter-spacing:12px;">
                      <span style="font-size:42px;font-weight:900;color:#000000;
                                   font-family:'Courier New',monospace;">
                        ${otp}
                      </span>
                    </div>

                    <p style="margin:0 0 8px;color:#ffffff;font-size:13px;text-align:center;">
                      ⏱ This code expires in <strong style="color:#f59e0b;">10 minutes</strong>.
                    </p>
                    <p style="margin:0 0 28px;color:#ffffff;font-size:12px;text-align:center;">
                      Do not share this code with anyone. NexusGov staff will never ask for your OTP.
                    </p>

                    <hr style="border:none;border-top:1px solid #334155;margin:0 0 24px;" />
                    <p style="margin:0;color:#ffffff;font-size:12px;text-align:center;">
                      If you did not request this, please ignore this email.<br/>
                      &copy; 2026 NexusGov — Sri Lanka Identity Management System
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
  };

  await transporter.sendMail(mailOptions);
};
