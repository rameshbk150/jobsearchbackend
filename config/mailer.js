import nodemailer from "nodemailer";
import "dotenv/config";

const transporter =
  nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

export const sendAdminOtpEmail =
  async ({
    email,
    name,
    otp,
  }) => {
    await transporter.sendMail({
      from: `"JobFinder Admin" <${process.env.SMTP_USER}>`,

      to: email,

      subject:
        "Your JobFinder Admin Login OTP",

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            max-width: 520px;
            margin: auto;
            padding: 30px;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
          "
        >
          <h2
            style="
              color: #0f172a;
              margin-bottom: 10px;
            "
          >
            JobFinder Admin Login
          </h2>

          <p
            style="
              color: #64748b;
              font-size: 14px;
            "
          >
            Hi ${name || "Admin"},
          </p>

          <p
            style="
              color: #64748b;
              font-size: 14px;
            "
          >
            Use the OTP below to complete your
            admin login.
          </p>

          <div
            style="
              margin: 25px 0;
              background: #eff6ff;
              color: #2563eb;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              text-align: center;
              padding: 20px;
              border-radius: 12px;
            "
          >
            ${otp}
          </div>

          <p
            style="
              color: #64748b;
              font-size: 13px;
            "
          >
            This OTP will expire in 5 minutes.
          </p>

          <p
            style="
              color: #94a3b8;
              font-size: 12px;
              margin-top: 25px;
            "
          >
            If you did not request this login,
            you can ignore this email.
          </p>
        </div>
      `,
    });
  };

export default transporter;
