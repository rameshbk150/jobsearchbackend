import express from "express";

import {
  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
} from "../controllers/userController.js";

import {
  verifyToken,
  adminOnly,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get(
  "/",
  verifyToken,
  adminOnly,
  getUsers
);

router.get(
  "/:id",
  verifyToken,
  adminOnly,
  getUserById
);

router.patch(
  "/:id/status",
  verifyToken,
  adminOnly,
  updateUserStatus
);

router.delete(
  "/:id",
  verifyToken,
  adminOnly,
  deleteUser
);

export default router;