import db from "../config/db.js";

/* =====================================================
   GET PROFILE
===================================================== */

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    const [rows] = await db.query(
      `
      SELECT
        cp.id,
        cp.user_id,

        u.name,
        u.email,

        cp.phone,
        cp.location,
        cp.job_title,
        cp.company,
        cp.experience,
        cp.education,
        cp.availability,
        cp.skills,
        cp.avatar,
        cp.resume,
        cp.created_at,
        cp.updated_at

      FROM candidate_profiles cp

      INNER JOIN users u
        ON cp.user_id = u.id

      WHERE cp.user_id = ?

      LIMIT 1
      `,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        profileExists: false,
        message: "Profile not found.",
      });
    }

    const profile = rows[0];

    let skills = [];

    try {
      skills = profile.skills
        ? JSON.parse(profile.skills)
        : [];
    } catch {
      skills = profile.skills
        ? profile.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean)
        : [];
    }

    return res.status(200).json({
      success: true,
      profileExists: true,

      profile: {
        ...profile,
        skills,
      },
    });
  } catch (error) {
    console.error(
      "Get Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to load profile.",
    });
  }
};

/* =====================================================
   CREATE PROFILE
===================================================== */

export const createProfile = async (
  req,
  res
) => {
  try {
    const {
      userId,
      phone,
      location,
      jobTitle,
      company,
      experience,
      education,
      availability,
      skills,
      avatar,
      resume,
    } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message:
          "You must be logged in to create a profile.",
      });
    }

    /* CHECK USER */

    const [users] = await db.query(
      `
      SELECT id, name, email, status
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

    if (users[0].status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          "Your account is not active.",
      });
    }

    /* CHECK EXISTING PROFILE */

    const [existing] = await db.query(
      `
      SELECT id
      FROM candidate_profiles
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message:
          "Profile already exists. Please edit your profile.",
      });
    }

    const skillsJson = JSON.stringify(
      Array.isArray(skills) ? skills : []
    );

    const [result] = await db.query(
      `
      INSERT INTO candidate_profiles
      (
        user_id,
        phone,
        location,
        job_title,
        company,
        experience,
        education,
        availability,
        skills,
        avatar,
        resume
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        phone || null,
        location || null,
        jobTitle || null,
        company || null,
        experience || null,
        education || null,
        availability || null,
        skillsJson,
        avatar || null,
        resume || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message:
        "Profile created successfully.",

      profileId: result.insertId,
    });
  } catch (error) {
    console.error(
      "Create Profile Error:",
      error
    );

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        success: false,
        message:
          "Profile already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create profile.",
    });
  }
};

/* =====================================================
   UPDATE PROFILE
===================================================== */

export const updateProfile = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const {
      phone,
      location,
      jobTitle,
      company,
      experience,
      education,
      availability,
      skills,
      avatar,
      resume,
    } = req.body;

    const skillsJson = JSON.stringify(
      Array.isArray(skills) ? skills : []
    );

    const [result] = await db.query(
      `
      UPDATE candidate_profiles

      SET
        phone = ?,
        location = ?,
        job_title = ?,
        company = ?,
        experience = ?,
        education = ?,
        availability = ?,
        skills = ?,
        avatar = ?,
        resume = ?

      WHERE user_id = ?
      `,
      [
        phone || null,
        location || null,
        jobTitle || null,
        company || null,
        experience || null,
        education || null,
        availability || null,
        skillsJson,
        avatar || null,
        resume || null,
        userId,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Profile not found. Create a profile first.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Profile updated successfully.",
    });
  } catch (error) {
    console.error(
      "Update Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update profile.",
    });
  }
};

/* =====================================================
   DELETE PROFILE
===================================================== */

export const deleteProfile = async (
  req,
  res
) => {
  try {
    const { userId } = req.params;

    const [result] = await db.query(
      `
      DELETE FROM candidate_profiles
      WHERE user_id = ?
      `,
      [userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Profile not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Profile deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Profile Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete profile.",
    });
  }
};