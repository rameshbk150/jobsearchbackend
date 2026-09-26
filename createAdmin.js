import bcrypt from "bcrypt";
import db from "./config/db.js";

const createAdmin = async () => {
  try {
    const email =
      "admin@jobfinder.com";

    const password =
      "Admin@123";

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    const [existing] =
      await db.query(
        `
        SELECT id
        FROM admins
        WHERE email = ?
        LIMIT 1
        `,
        [email]
      );

    if (existing.length > 0) {
      await db.query(
        `
        UPDATE admins
        SET
          name = ?,
          password = ?,
          role = ?,
          status = ?
        WHERE email = ?
        `,
        [
          "Super Admin",
          hashedPassword,
          "super_admin",
          "active",
          email,
        ]
      );

      console.log(
        "Admin updated successfully."
      );
    } else {
      await db.query(
        `
        INSERT INTO admins (
          name,
          email,
          password,
          role,
          status
        )
        VALUES (?, ?, ?, ?, ?)
        `,
        [
          "Super Admin",
          email,
          hashedPassword,
          "super_admin",
          "active",
        ]
      );

      console.log(
        "Admin created successfully."
      );
    }

    console.log(
      "Email:",
      email
    );

    console.log(
      "Password:",
      password
    );

    process.exit(0);
  } catch (error) {
    console.error(
      "Create Admin Error:",
      error
    );

    process.exit(1);
  }
};

createAdmin();