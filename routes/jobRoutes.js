import express from "express";

import {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController.js";

const router = express.Router();

/*
  TEMPORARY:
  Authentication removed so your
  Next.js Admin Panel can test CRUD.

  Later, after admin login is connected,
  we will add verifyToken + adminOnly back.
*/

/* GET ALL JOBS */
router.get("/", getJobs);

/* GET SINGLE JOB */
router.get("/:id", getJobById);

/* CREATE JOB */
router.post("/", createJob);

/* UPDATE JOB */
router.put("/:id", updateJob);

/* DELETE JOB */
router.delete("/:id", deleteJob);

export default router;