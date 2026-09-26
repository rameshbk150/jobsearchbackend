import express from "express";

import {
  applyForJob,
  getAllApplications,
  getApplicationById,
  getUserApplications,
  checkUserApplication,
  updateApplicationStatus,
  deleteApplication,
} from "../controllers/applicationController.js";

const router = express.Router();

/* =========================================
   APPLY FOR JOB
   POST /api/applications
========================================= */

router.post(
  "/",
  applyForJob
);

/* =========================================
   GET ALL APPLICATIONS
   GET /api/applications
========================================= */

router.get(
  "/",
  getAllApplications
);

/* =========================================
   GET USER APPLICATIONS
   GET /api/applications/user/5
========================================= */

router.get(
  "/user/:userId",
  getUserApplications
);

/* =========================================
   CHECK USER APPLICATION
   GET /api/applications/check/5/2
========================================= */

router.get(
  "/check/:userId/:jobId",
  checkUserApplication
);

/* =========================================
   GET ONE APPLICATION
   GET /api/applications/1
========================================= */

router.get(
  "/:id",
  getApplicationById
);

/* =========================================
   UPDATE STATUS
   PATCH /api/applications/1/status
========================================= */

router.patch(
  "/:id/status",
  updateApplicationStatus
);

/* =========================================
   DELETE APPLICATION
   DELETE /api/applications/1
========================================= */

router.delete(
  "/:id",
  deleteApplication
);

export default router;