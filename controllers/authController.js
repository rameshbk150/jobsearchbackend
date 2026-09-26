import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import db from "../config/db.js";

import {
  sendAdminOtpEmail,
} from "../config/mailer.js";

/* =========================================
   CREATE JWT TOKEN
========================================= */

const createToken = (
  payload,
  expiresIn = "7d"
) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn,
    }
  );
};

/* =========================================
   GENERATE OTP
========================================= */

const generateOtp = () => {
  return crypto.randomInt(
    100000,
    1000000
  ).toString();
};

/* =========================================
   REGISTER USER
========================================= */

export const registerUser = async (
  req,
  res
) => {
  try {
    const {
      name,
      email,
      password,
      phone,
    } = req.body;

    if (
      !name?.trim() ||
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Name, email and password are required.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const [existingUsers] =
      await db.query(
        `
        SELECT id
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [normalizedEmail]
      );

    if (
      existingUsers.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Email is already registered.",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const [result] =
      await db.query(
        `
        INSERT INTO users (
          name,
          email,
          password,
          phone,
          status
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          name.trim(),
          normalizedEmail,
          hashedPassword,
          phone?.trim() || null,
          "active",
        ]
      );

    const token =
      createToken({
        id: result.insertId,
        email: normalizedEmail,
        role: "user",
      });

    return res.status(201).json({
      success: true,
      message:
        "Account created successfully.",

      token,

      user: {
        id: result.insertId,
        name: name.trim(),
        email: normalizedEmail,
        phone:
          phone?.trim() || null,
        role: "user",
      },
    });
  } catch (error) {
    console.error(
      "Register Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to register user.",
      error:
        error.message,
    });
  }
};

/* =========================================
   USER LOGIN
========================================= */

export const loginUser = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const [users] =
      await db.query(
        `
        SELECT *
        FROM users
        WHERE email = ?
        LIMIT 1
        `,
        [normalizedEmail]
      );

    if (
      users.length === 0
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const user =
      users[0];

    if (
      user.status ===
      "blocked"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account has been blocked.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        user.password
      );

    if (
      !passwordMatches
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const token =
      createToken({
        id: user.id,
        email: user.email,
        role: "user",
      });

    return res.status(200).json({
      success: true,
      message:
        "Login successful.",

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location:
          user.location,
        title:
          user.title,
        experience:
          user.experience,
        education:
          user.education,
        skills:
          user.skills,
        avatar:
          user.avatar,
        resume:
          user.resume,
        role: "user",
      },
    });
  } catch (error) {
    console.error(
      "User Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to login.",
      error:
        error.message,
    });
  }
};

/* =========================================
   ADMIN LOGIN
   EMAIL + PASSWORD
========================================= */

export const adminLogin = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (
      !email?.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email and password are required.",
      });
    }

    const normalizedEmail =
      email
        .trim()
        .toLowerCase();

    const [admins] =
      await db.query(
        `
        SELECT *
        FROM admins
        WHERE email = ?
        LIMIT 1
        `,
        [normalizedEmail]
      );

    if (
      admins.length === 0
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    const admin =
      admins[0];

    if (
      admin.status &&
      admin.status !==
        "active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Admin account is inactive.",
      });
    }

    const passwordMatches =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (
      !passwordMatches
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid email or password.",
      });
    }

    /* =====================================
       REMOVE OLD OTP
    ===================================== */

    await db.query(
      `
      DELETE FROM admin_login_otps
      WHERE admin_id = ?
      `,
      [admin.id]
    );

    /* =====================================
       GENERATE OTP
    ===================================== */

    const otp =
      generateOtp();

    const otpHash =
      await bcrypt.hash(
        otp,
        10
      );

    const expiresAt =
      new Date(
        Date.now() +
          5 * 60 * 1000
      );

    /* =====================================
       SAVE OTP
    ===================================== */

    await db.query(
      `
      INSERT INTO admin_login_otps (
        admin_id,
        otp_hash,
        expires_at
      )
      VALUES (?, ?, ?)
      `,
      [
        admin.id,
        otpHash,
        expiresAt,
      ]
    );

    /* =====================================
       SEND OTP EMAIL
    ===================================== */

    await sendAdminOtpEmail({
      email:
        admin.email,

      name:
        admin.name,

      otp,
    });

    /* =====================================
       MASK EMAIL
    ===================================== */

    const [localPart, domain] =
      admin.email.split("@");

    const maskedEmail =
      localPart.length <= 2
        ? `${localPart[0]}***@${domain}`
        : `${localPart.slice(
            0,
            2
          )}***@${domain}`;

    return res.status(200).json({
      success: true,

      otpRequired: true,

      message:
        "OTP sent to your registered email address.",

      adminId:
        admin.id,

      email:
        maskedEmail,
    });
  } catch (error) {
    console.error(
      "Admin Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send admin login OTP.",
      error:
        error.message,
    });
  }
};

/* =========================================
   VERIFY ADMIN OTP
========================================= */

export const verifyAdminOtp =
  async (
    req,
    res
  ) => {
    try {
      const {
        adminId,
        otp,
      } = req.body;

      if (
        !adminId ||
        !otp
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Admin ID and OTP are required.",
        });
      }

      if (
        String(otp).length !== 6
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP must be 6 digits.",
        });
      }

      /* =====================================
         GET OTP RECORD
      ===================================== */

      const [otpRecords] =
        await db.query(
          `
          SELECT *
          FROM admin_login_otps
          WHERE admin_id = ?
          ORDER BY id DESC
          LIMIT 1
          `,
          [adminId]
        );

      if (
        otpRecords.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "OTP not found. Please login again.",
        });
      }

      const otpRecord =
        otpRecords[0];

      /* =====================================
         CHECK EXPIRY
      ===================================== */

      if (
        new Date() >
        new Date(
          otpRecord.expires_at
        )
      ) {
        await db.query(
          `
          DELETE FROM admin_login_otps
          WHERE admin_id = ?
          `,
          [adminId]
        );

        return res.status(400).json({
          success: false,
          message:
            "OTP has expired. Please login again.",
        });
      }

      /* =====================================
         VERIFY OTP
      ===================================== */

      const otpMatches =
        await bcrypt.compare(
          String(otp),
          otpRecord.otp_hash
        );

      if (
        !otpMatches
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid OTP.",
        });
      }

      /* =====================================
         GET ADMIN
      ===================================== */

      const [admins] =
        await db.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            status
          FROM admins
          WHERE id = ?
          LIMIT 1
          `,
          [adminId]
        );

      if (
        admins.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Admin not found.",
        });
      }

      const admin =
        admins[0];

      if (
        admin.status &&
        admin.status !==
          "active"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin account is inactive.",
        });
      }

      /* =====================================
         REMOVE USED OTP
      ===================================== */

      await db.query(
        `
        DELETE FROM admin_login_otps
        WHERE admin_id = ?
        `,
        [adminId]
      );

      /* =====================================
         CREATE JWT
      ===================================== */

      const role =
        admin.role ||
        "admin";

      const token =
        createToken(
          {
            id:
              admin.id,

            email:
              admin.email,

            role,
          },
          "1d"
        );

      return res.status(200).json({
        success: true,

        message:
          "OTP verified successfully.",

        token,

        admin: {
          id:
            admin.id,

          name:
            admin.name,

          email:
            admin.email,

          role,
        },
      });
    } catch (error) {
      console.error(
        "Verify Admin OTP Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify OTP.",
        error:
          error.message,
      });
    }
  };

/* =========================================
   RESEND ADMIN OTP
========================================= */

export const resendAdminOtp =
  async (
    req,
    res
  ) => {
    try {
      const {
        adminId,
      } = req.body;

      if (
        !adminId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Admin ID is required.",
        });
      }

      const [admins] =
        await db.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            status
          FROM admins
          WHERE id = ?
          LIMIT 1
          `,
          [adminId]
        );

      if (
        admins.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Admin not found.",
        });
      }

      const admin =
        admins[0];

      if (
        admin.status &&
        admin.status !==
          "active"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin account is inactive.",
        });
      }

      await db.query(
        `
        DELETE FROM admin_login_otps
        WHERE admin_id = ?
        `,
        [admin.id]
      );

      const otp =
        generateOtp();

      const otpHash =
        await bcrypt.hash(
          otp,
          10
        );

      const expiresAt =
        new Date(
          Date.now() +
            5 * 60 * 1000
        );

      await db.query(
        `
        INSERT INTO admin_login_otps (
          admin_id,
          otp_hash,
          expires_at
        )
        VALUES (?, ?, ?)
        `,
        [
          admin.id,
          otpHash,
          expiresAt,
        ]
      );

      await sendAdminOtpEmail({
        email:
          admin.email,

        name:
          admin.name,

        otp,
      });

      return res.status(200).json({
        success: true,
        message:
          "New OTP sent successfully.",
      });
    } catch (error) {
      console.error(
        "Resend OTP Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to resend OTP.",
        error:
          error.message,
      });
    }
  };

/* =========================================
   GET CURRENT USER
========================================= */

export const getCurrentUser =
  async (
    req,
    res
  ) => {
    try {
      if (
        req.user?.role !==
        "user"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "User access required.",
        });
      }

      const [users] =
        await db.query(
          `
          SELECT
            id,
            name,
            email,
            phone,
            location,
            title,
            experience,
            education,
            skills,
            avatar,
            resume,
            status,
            created_at
          FROM users
          WHERE id = ?
          LIMIT 1
          `,
          [
            req.user.id,
          ]
        );

      if (
        users.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.status(200).json({
        success: true,
        user:
          users[0],
      });
    } catch (error) {
      console.error(
        "Get Current User Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch user.",
        error:
          error.message,
      });
    }
  };

/* =========================================
   GET CURRENT ADMIN
========================================= */

export const getCurrentAdmin =
  async (
    req,
    res
  ) => {
    try {
      const [admins] =
        await db.query(
          `
          SELECT
            id,
            name,
            email,
            role,
            status,
            created_at
          FROM admins
          WHERE id = ?
          LIMIT 1
          `,
          [
            req.user.id,
          ]
        );

      if (
        admins.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Admin not found.",
        });
      }

      const admin =
        admins[0];

      if (
        admin.status &&
        admin.status !==
          "active"
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Admin account is inactive.",
        });
      }

      return res.status(200).json({
        success: true,
        admin,
      });
    } catch (error) {
      console.error(
        "Get Current Admin Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch admin.",
        error:
          error.message,
      });
    }
  };

/* =========================================
   USER LOGOUT
========================================= */

export const logoutUser =
  async (
    req,
    res
  ) => {
    return res.status(200).json({
      success: true,
      message:
        "User logged out successfully.",
    });
  };

/* =========================================
   ADMIN LOGOUT
========================================= */

export const adminLogout =
  async (
    req,
    res
  ) => {
    try {
      if (
        req.user?.id
      ) {
        await db.query(
          `
          DELETE FROM admin_login_otps
          WHERE admin_id = ?
          `,
          [
            req.user.id,
          ]
        );
      }

      return res.status(200).json({
        success: true,
        message:
          "Admin logged out successfully.",
      });
    } catch (error) {
      console.error(
        "Admin Logout Error:",
        error
      );

      return res.status(200).json({
        success: true,
        message:
          "Admin logged out successfully.",
      });
    }
  };