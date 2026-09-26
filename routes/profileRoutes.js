import express from "express";

import {
  getProfile,
  createProfile,
  updateProfile,
  deleteProfile,
} from "../controllers/profileController.js";

const router = express.Router();

/* CREATE PROFILE */
router.post(
  "/",
  createProfile
);

/* GET PROFILE */
router.get(
  "/:userId",
  getProfile
);

/* UPDATE PROFILE */
router.put(
  "/:userId",
  updateProfile
);

/* DELETE PROFILE */
router.delete(
  "/:userId",
  deleteProfile
);

export default router;