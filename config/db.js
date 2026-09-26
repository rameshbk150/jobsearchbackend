import mysql from "mysql2/promise";
import "dotenv/config";

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const testDatabaseConnection = async () => {
  try {
    const connection =
      await db.getConnection();

    console.log(
      "MySQL database connected successfully"
    );

    connection.release();
  } catch (error) {
    console.error(
      "MySQL connection failed:",
      error.message
    );
  }
};

export const initializeDatabase = async () => {
  const tableStatements = [
    `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      location VARCHAR(255) DEFAULT NULL,
      title VARCHAR(255) DEFAULT NULL,
      experience VARCHAR(255) DEFAULT NULL,
      education VARCHAR(255) DEFAULT NULL,
      skills JSON DEFAULT NULL,
      avatar VARCHAR(255) DEFAULT NULL,
      resume VARCHAR(255) DEFAULT NULL,
      status ENUM('active', 'blocked') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `,

    `
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `,

    `
    CREATE TABLE IF NOT EXISTS admin_login_otps (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT NOT NULL,
      otp_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `,

    `
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      logo VARCHAR(255) DEFAULT NULL,
      industry VARCHAR(255) DEFAULT NULL,
      location VARCHAR(255) DEFAULT NULL,
      headquarters VARCHAR(255) DEFAULT NULL,
      employees INT DEFAULT NULL,
      founded VARCHAR(50) DEFAULT NULL,
      company_type VARCHAR(100) DEFAULT NULL,
      website VARCHAR(255) DEFAULT NULL,
      description TEXT DEFAULT NULL,
      about TEXT DEFAULT NULL,
      specialties JSON DEFAULT NULL,
      benefits JSON DEFAULT NULL,
      work_culture TEXT DEFAULT NULL,
      open_roles JSON DEFAULT NULL,
      status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `,

    `
    CREATE TABLE IF NOT EXISTS job_posts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      company_id INT DEFAULT NULL,
      company VARCHAR(255) NOT NULL,
      location VARCHAR(255) DEFAULT NULL,
      salary VARCHAR(100) DEFAULT NULL,
      type VARCHAR(100) DEFAULT NULL,
      work_mode VARCHAR(100) DEFAULT NULL,
      category VARCHAR(100) DEFAULT NULL,
      experience VARCHAR(100) DEFAULT NULL,
      qualification VARCHAR(255) DEFAULT NULL,
      skills JSON DEFAULT NULL,
      description TEXT DEFAULT NULL,
      responsibilities JSON DEFAULT NULL,
      openings INT DEFAULT 1,
      posted_date DATE DEFAULT NULL,
      deadline DATE DEFAULT NULL,
      featured TINYINT(1) NOT NULL DEFAULT 0,
      status ENUM('active', 'inactive', 'closed') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `,

    `
    CREATE TABLE IF NOT EXISTS applications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      job_id INT NOT NULL,
      candidate_name VARCHAR(255) NOT NULL,
      candidate_email VARCHAR(255) NOT NULL,
      job_title VARCHAR(255) NOT NULL,
      company VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Pending',
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `,

    `
    CREATE TABLE IF NOT EXISTS candidate_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      phone VARCHAR(50) DEFAULT NULL,
      location VARCHAR(255) DEFAULT NULL,
      job_title VARCHAR(255) DEFAULT NULL,
      company VARCHAR(255) DEFAULT NULL,
      experience VARCHAR(255) DEFAULT NULL,
      education VARCHAR(255) DEFAULT NULL,
      availability VARCHAR(255) DEFAULT NULL,
      skills JSON DEFAULT NULL,
      avatar VARCHAR(255) DEFAULT NULL,
      resume VARCHAR(255) DEFAULT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `,
  ];

  try {
    for (const statement of tableStatements) {
      await db.query(statement);
    }

    console.log(
      "Database schema checked and required tables are ready."
    );
  } catch (error) {
    console.error(
      "Database schema initialization failed:",
      error.message
    );
    throw error;
  }
};

export default db;