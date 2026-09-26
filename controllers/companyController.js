import db from "../config/db.js";

/* =========================================
   GET ALL COMPANIES
========================================= */

export const getCompanies = async (
  req,
  res
) => {
  try {
    const [companies] =
      await db.query(`
        SELECT
          id,
          name,
          logo,
          industry,
          location,
          headquarters,
          employees,
          founded,
          company_type,
          website,
          description,
          about,
          specialties,
          benefits,
          work_culture,
          open_roles,
          status,
          created_at,
          updated_at
        FROM companies
        ORDER BY id DESC
      `);

    return res.status(200).json({
      success: true,
      count: companies.length,
      companies,
    });
  } catch (error) {
    console.error(
      "GET COMPANIES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch companies.",
      error: error.message,
    });
  }
};

/* =========================================
   GET SINGLE COMPANY
========================================= */

export const getCompanyById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [companies] =
      await db.query(
        `
        SELECT *
        FROM companies
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

    if (companies.length === 0) {
      return res.status(404).json({
        success: false,
        message:
          "Company not found.",
      });
    }

    return res.status(200).json({
      success: true,
      company: companies[0],
    });
  } catch (error) {
    console.error(
      "GET COMPANY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch company.",
      error: error.message,
    });
  }
};

/* =========================================
   CREATE COMPANY
========================================= */

export const createCompany = async (
  req,
  res
) => {
  try {
    const {
      name,
      logo,
      industry,
      location,
      headquarters,
      employees,
      founded,
      company_type,
      website,
      description,
      about,
      specialties,
      benefits,
      work_culture,
      open_roles,
      status,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Company name is required.",
      });
    }

    const specialtiesValue =
      JSON.stringify(
        Array.isArray(specialties)
          ? specialties
          : []
      );

    const benefitsValue =
      JSON.stringify(
        Array.isArray(benefits)
          ? benefits
          : []
      );

    const openRolesValue =
      JSON.stringify(
        Array.isArray(open_roles)
          ? open_roles
          : []
      );

    const [result] =
      await db.query(
        `
        INSERT INTO companies (
          name,
          logo,
          industry,
          location,
          headquarters,
          employees,
          founded,
          company_type,
          website,
          description,
          about,
          specialties,
          benefits,
          work_culture,
          open_roles,
          status
        )
        VALUES (
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?, ?, ?, ?, ?,
          ?
        )
        `,
        [
          name.trim(),
          logo || null,
          industry || null,
          location || null,
          headquarters || null,
          employees || null,
          founded || null,
          company_type || null,
          website || null,
          description || null,
          about || null,
          specialtiesValue,
          benefitsValue,
          work_culture || null,
          openRolesValue,
          status || "active",
        ]
      );

    return res.status(201).json({
      success: true,
      message:
        "Company added successfully.",
      company: {
        id: result.insertId,
        name: name.trim(),
      },
    });
  } catch (error) {
    console.error(
      "CREATE COMPANY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to add company.",
      error: error.message,
    });
  }
};

/* =========================================
   UPDATE COMPANY
========================================= */

export const updateCompany = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      name,
      logo,
      industry,
      location,
      headquarters,
      employees,
      founded,
      company_type,
      website,
      description,
      about,
      specialties,
      benefits,
      work_culture,
      open_roles,
      status,
    } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Company name is required.",
      });
    }

    const [result] =
      await db.query(
        `
        UPDATE companies
        SET
          name = ?,
          logo = ?,
          industry = ?,
          location = ?,
          headquarters = ?,
          employees = ?,
          founded = ?,
          company_type = ?,
          website = ?,
          description = ?,
          about = ?,
          specialties = ?,
          benefits = ?,
          work_culture = ?,
          open_roles = ?,
          status = ?
        WHERE id = ?
        `,
        [
          name.trim(),
          logo || null,
          industry || null,
          location || null,
          headquarters || null,
          employees || null,
          founded || null,
          company_type || null,
          website || null,
          description || null,
          about || null,

          JSON.stringify(
            Array.isArray(specialties)
              ? specialties
              : []
          ),

          JSON.stringify(
            Array.isArray(benefits)
              ? benefits
              : []
          ),

          work_culture || null,

          JSON.stringify(
            Array.isArray(open_roles)
              ? open_roles
              : []
          ),

          status || "active",
          id,
        ]
      );

    if (
      result.affectedRows === 0
    ) {
      return res.status(404).json({
        success: false,
        message:
          "Company not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Company updated successfully.",
    });
  } catch (error) {
    console.error(
      "UPDATE COMPANY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update company.",
      error: error.message,
    });
  }
};

/* =========================================
   DELETE COMPANY
========================================= */

export const deleteCompany = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const [result] =
      await db.query(
        `
        DELETE FROM companies
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
          "Company not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Company deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE COMPANY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete company.",
      error: error.message,
    });
  }
};