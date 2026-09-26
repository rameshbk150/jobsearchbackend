import express from "express";

import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../controllers/companyController.js";

const router = express.Router();

/*
  TEMPORARY:
  No authentication until admin login is connected.
*/

router.get("/", getCompanies);

router.get("/:id", getCompanyById);

router.post("/", createCompany);

router.put("/:id", updateCompany);

router.delete("/:id", deleteCompany);

export default router;