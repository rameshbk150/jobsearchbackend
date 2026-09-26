import db from "../config/db.js";

/* =========================================
   GET ALL JOBS
========================================= */

export const getJobs = async (req, res) => {
  try {
    const [jobs] = await db.query(`
      SELECT *
      FROM job_posts
      ORDER BY created_at DESC
    `);

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error("Get Jobs Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch jobs.",
      error: error.message,
    });
  }
};

/* =========================================
   GET SINGLE JOB
========================================= */

export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const [jobs] = await db.query(
      `
      SELECT *
      FROM job_posts
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (jobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      job: jobs[0],
    });
  } catch (error) {
    console.error("Get Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to fetch job.",
      error: error.message,
    });
  }
};

/* =========================================
   CREATE JOB
========================================= */

export const createJob = async (req, res) => {
  try {
    const {
      title,
      company_id,
      company,
      location,
      salary,
      type,
      work_mode,
      category,
      experience,
      qualification,
      skills,
      description,
      responsibilities,
      openings,
      posted_date,
      deadline,
      featured,
      status,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required.",
      });
    }

    if (!company?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    /* VALIDATE COMPANY ID IF PROVIDED */

    if (company_id) {
      const [companies] = await db.query(
        `
        SELECT id
        FROM companies
        WHERE id = ?
        LIMIT 1
        `,
        [company_id]
      );

      if (companies.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected company does not exist.",
        });
      }
    }

    const skillsValue = JSON.stringify(
      Array.isArray(skills) ? skills : []
    );

    const responsibilitiesValue = JSON.stringify(
      Array.isArray(responsibilities)
        ? responsibilities
        : []
    );

    const [result] = await db.query(
      `
      INSERT INTO job_posts (
        title,
        company_id,
        company,
        location,
        salary,
        type,
        work_mode,
        category,
        experience,
        qualification,
        skills,
        description,
        responsibilities,
        openings,
        posted_date,
        deadline,
        featured,
        status
      )
      VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      `,
      [
        title.trim(),
        company_id || null,
        company.trim(),
        location?.trim() || null,
        salary?.trim() || null,
        type || null,
        work_mode || null,
        category?.trim() || null,
        experience?.trim() || null,
        qualification?.trim() || null,
        skillsValue,
        description?.trim() || null,
        responsibilitiesValue,
        Number(openings) || 1,
        posted_date || null,
        deadline || null,
        featured ? 1 : 0,
        status || "active",
      ]
    );

    const [createdJobs] = await db.query(
      `
      SELECT *
      FROM job_posts
      WHERE id = ?
      LIMIT 1
      `,
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      message: "Job created successfully.",
      job: createdJobs[0],
    });
  } catch (error) {
    console.error("Create Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create job.",
      error: error.message,
    });
  }
};

/* =========================================
   UPDATE JOB
========================================= */

export const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      company_id,
      company,
      location,
      salary,
      type,
      work_mode,
      category,
      experience,
      qualification,
      skills,
      description,
      responsibilities,
      openings,
      posted_date,
      deadline,
      featured,
      status,
    } = req.body;

    const [existingJobs] = await db.query(
      `
      SELECT *
      FROM job_posts
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    if (existingJobs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Job title is required.",
      });
    }

    if (!company?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Company name is required.",
      });
    }

    /* VALIDATE COMPANY ID */

    if (company_id) {
      const [companies] = await db.query(
        `
        SELECT id
        FROM companies
        WHERE id = ?
        LIMIT 1
        `,
        [company_id]
      );

      if (companies.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Selected company does not exist.",
        });
      }
    }

    const allowedStatuses = [
      "active",
      "inactive",
      "expired",
    ];

    const finalStatus = allowedStatuses.includes(status)
      ? status
      : "active";

    await db.query(
      `
      UPDATE job_posts
      SET
        title = ?,
        company_id = ?,
        company = ?,
        location = ?,
        salary = ?,
        type = ?,
        work_mode = ?,
        category = ?,
        experience = ?,
        qualification = ?,
        skills = ?,
        description = ?,
        responsibilities = ?,
        openings = ?,
        posted_date = ?,
        deadline = ?,
        featured = ?,
        status = ?
      WHERE id = ?
      `,
      [
        title.trim(),
        company_id || null,
        company.trim(),
        location?.trim() || null,
        salary?.trim() || null,
        type || null,
        work_mode || null,
        category?.trim() || null,
        experience?.trim() || null,
        qualification?.trim() || null,

        JSON.stringify(
          Array.isArray(skills) ? skills : []
        ),

        description?.trim() || null,

        JSON.stringify(
          Array.isArray(responsibilities)
            ? responsibilities
            : []
        ),

        Number(openings) || 1,
        posted_date || null,
        deadline || null,
        featured ? 1 : 0,
        finalStatus,
        id,
      ]
    );

    const [updatedJobs] = await db.query(
      `
      SELECT *
      FROM job_posts
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      job: updatedJobs[0],
    });
  } catch (error) {
    console.error("Update Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update job.",
      error: error.message,
    });
  }
};

/* =========================================
   DELETE JOB
========================================= */

export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      `
      DELETE FROM job_posts
      WHERE id = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Job Error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete job.",
      error: error.message,
    });
  }
};