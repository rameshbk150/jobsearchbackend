import jwt from "jsonwebtoken";

/* =========================================
   VERIFY JWT
========================================= */

export const verifyToken = (
  req,
  res,
  next
) => {
  try {
    const authorization =
      req.headers.authorization;

    if (
      !authorization
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authorization token is required.",
      });
    }

    if (
      !authorization.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid authorization format.",
      });
    }

    const token =
      authorization
        .split(" ")[1]
        ?.trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message:
          "Token is required.",
      });
    }

    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    req.user =
      decoded;

    next();
  } catch (error) {
    console.error(
      "JWT Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Invalid or expired token.",
    });
  }
};

/* =========================================
   ADMIN ONLY
========================================= */

export const adminOnly = (
  req,
  res,
  next
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message:
        "Authentication required.",
    });
  }

  if (
    req.user.role !==
      "admin" &&
    req.user.role !==
      "super_admin"
  ) {
    return res.status(403).json({
      success: false,
      message:
        "Admin access required.",
    });
  }

  next();
};