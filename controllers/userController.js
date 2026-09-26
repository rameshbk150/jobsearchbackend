import db from "../config/db.js";

/* =========================================
   GET ALL USERS
========================================= */

export const getUsers = async (
  req,
  res
) => {
  try {
    const [users] = await db.query(`
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
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    return res.json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get Users Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch users.",
    });
  }
};

/* =========================================
   GET USER BY ID
========================================= */

export const getUserById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

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
          created_at,
          updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      user: users[0],
    });
  } catch (error) {
    console.error(
      "Get User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch user.",
    });
  }
};

/* =========================================
   UPDATE USER STATUS
========================================= */

export const updateUserStatus =
  async (req, res) => {
    try {
      const { id } = req.params;

      const { status } = req.body;

      const allowedStatuses = [
        "active",
        "blocked",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user status.",
        });
      }

      const [result] =
        await db.query(
          `
          UPDATE users
          SET status = ?
          WHERE id = ?
          `,
          [status, id]
        );

      if (
        result.affectedRows === 0
      ) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.json({
        success: true,
        message:
          "User status updated successfully.",
      });
    } catch (error) {
      console.error(
        "User Status Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update user status.",
      });
    }
  };

/* =========================================
   DELETE USER
========================================= */

export const deleteUser = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [result] =
      await db.query(
        `
        DELETE FROM users
        WHERE id = ?
        `,
        [id]
      );

    if (
      result.affectedRows === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      message:
        "User deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete user.",
    });
  }
};