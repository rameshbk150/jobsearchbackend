import db from "../config/db.js";

/* =====================================================
   APPLY FOR JOB
===================================================== */

export const applyForJob = async (
  req,
  res
) => {
  try {
    const {
      userId,
      jobId,
      jobTitle,
      company,
    } = req.body;

    if (
      !userId ||
      !jobId ||
      !jobTitle ||
      !company
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Required application data is missing.",
      });
    }

    /* =========================================
       CHECK USER
    ========================================= */

    const [users] = await db.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        location,
        status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = users[0];

    if (
      user.status !== "active"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not active.",
      });
    }

    /* =========================================
       CHECK DUPLICATE APPLICATION
    ========================================= */

    const [existingApplication] =
      await db.query(
        `
        SELECT id
        FROM applications
        WHERE user_id = ?
        AND job_id = ?
        LIMIT 1
        `,
        [
          userId,
          jobId,
        ]
      );

    if (
      existingApplication.length > 0
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already applied for this job.",
      });
    }

    /* =========================================
       INSERT APPLICATION
    ========================================= */

    const [result] = await db.query(
      `
      INSERT INTO applications
      (
        user_id,
        job_id,
        candidate_name,
        candidate_email,
        job_title,
        company,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'Pending')
      `,
      [
        user.id,
        jobId,
        user.name,
        user.email,
        jobTitle.trim(),
        company.trim(),
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Application submitted successfully.",

      application: {
        id: result.insertId,
        userId: user.id,
        jobId,
        candidateName: user.name,
        candidateEmail:
          user.email,
        phone:
          user.phone || null,
        location:
          user.location || null,
        jobTitle,
        company,
        status: "Pending",
      },
    });
  } catch (error) {
    console.error(
      "Apply For Job Error:",
      error
    );

    if (
      error.code ===
      "ER_DUP_ENTRY"
    ) {
      return res.status(409).json({
        success: false,
        message:
          "You have already applied for this job.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Something went wrong while submitting application.",
    });
  }
};

/* =====================================================
   GET ALL APPLICATIONS
===================================================== */

export const getAllApplications =
  async (req, res) => {
    try {
      const [applications] =
        await db.query(
          `
          SELECT
            a.id,
            a.user_id,
            a.job_id,
            a.candidate_name,
            a.candidate_email,
            a.job_title,
            a.company,
            a.status,
            a.applied_at,

            u.phone,
            u.location,
            u.title,
            u.experience,
            u.education,
            u.skills,
            u.resume

          FROM applications a

          LEFT JOIN users u
          ON a.user_id = u.id

          ORDER BY
            a.applied_at DESC
          `
        );

      return res.status(200).json({
        success: true,
        count:
          applications.length,
        applications,
      });
    } catch (error) {
      console.error(
        "Get Applications Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to get applications.",
      });
    }
  };

/* =====================================================
   GET ONE APPLICATION
===================================================== */

export const getApplicationById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const [applications] =
        await db.query(
          `
          SELECT
            a.id,
            a.user_id,
            a.job_id,
            a.candidate_name,
            a.candidate_email,
            a.job_title,
            a.company,
            a.status,
            a.applied_at,

            u.phone,
            u.location,
            u.title,
            u.experience,
            u.education,
            u.skills,
            u.avatar,
            u.resume

          FROM applications a

          LEFT JOIN users u
          ON a.user_id = u.id

          WHERE a.id = ?

          LIMIT 1
          `,
          [id]
        );

      if (
        applications.length === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found.",
        });
      }

      return res.status(200).json({
        success: true,
        application:
          applications[0],
      });
    } catch (error) {
      console.error(
        "Get Application Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to get application.",
      });
    }
  };

/* =====================================================
   GET USER APPLICATIONS
===================================================== */

export const getUserApplications =
  async (req, res) => {
    try {
      const { userId } =
        req.params;

      const [applications] =
        await db.query(
          `
          SELECT
            id,
            user_id,
            job_id,
            candidate_name,
            candidate_email,
            job_title,
            company,
            status,
            applied_at
          FROM applications
          WHERE user_id = ?
          ORDER BY
            applied_at DESC
          `,
          [userId]
        );

      return res.status(200).json({
        success: true,
        count:
          applications.length,
        applications,
      });
    } catch (error) {
      console.error(
        "Get User Applications Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to get user applications.",
      });
    }
  };

/* =====================================================
   CHECK IF USER ALREADY APPLIED
===================================================== */

export const checkUserApplication =
  async (req, res) => {
    try {
      const {
        userId,
        jobId,
      } = req.params;

      const [applications] =
        await db.query(
          `
          SELECT
            id,
            status,
            applied_at
          FROM applications
          WHERE user_id = ?
          AND job_id = ?
          LIMIT 1
          `,
          [
            userId,
            jobId,
          ]
        );

      if (
        applications.length === 0
      ) {
        return res.status(200).json({
          success: true,
          applied: false,
        });
      }

      return res.status(200).json({
        success: true,
        applied: true,
        application:
          applications[0],
      });
    } catch (error) {
      console.error(
        "Check Application Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to check application.",
      });
    }
  };

/* =====================================================
   UPDATE APPLICATION STATUS
===================================================== */

export const updateApplicationStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const { status } =
        req.body;

      const allowedStatuses = [
        "Pending",
        "Reviewed",
        "Shortlisted",
        "Rejected",
        "Hired",
      ];

      if (
        !status ||
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid application status.",
        });
      }

      const [result] =
        await db.query(
          `
          UPDATE applications
          SET status = ?
          WHERE id = ?
          `,
          [
            status,
            id,
          ]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Application status updated successfully.",
        status,
      });
    } catch (error) {
      console.error(
        "Update Application Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update application status.",
      });
    }
  };

/* =====================================================
   DELETE APPLICATION
===================================================== */

export const deleteApplication =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const [result] =
        await db.query(
          `
          DELETE FROM applications
          WHERE id = ?
          `,
          [id]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "Application not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Application deleted successfully.",
      });
    } catch (error) {
      console.error(
        "Delete Application Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete application.",
      });
    }
  };