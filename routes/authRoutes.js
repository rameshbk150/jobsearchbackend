import express from "express";

import {
  registerUser,
  loginUser,
  adminLogin,
  verifyAdminOtp,
  getCurrentAdmin,
  adminLogout,
} from "../controllers/authController.js";

import {
  verifyToken,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router =
  express.Router();

/* USER */

router.post(
  "/register",
  registerUser
);

router.post(
  "/login",
  loginUser
);

/* ADMIN LOGIN */

router.post(
  "/admin/login",
  adminLogin
);

/* ADMIN OTP */

router.post(
  "/admin/verify-otp",
  verifyAdminOtp
);

/* CURRENT ADMIN */

router.get(
  "/admin/me",
  verifyToken,
  adminOnly,
  getCurrentAdmin
);

/* LOGOUT */

router.post(
  "/admin/logout",
  verifyToken,
  adminOnly,
  adminLogout
);

export default router;