//import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" }); // Load environment variables from config.env
import db from "../db/connection.js";

export async function verifyEmailMiddleware(req, res, next) {
  const user = await db.collection("users").findOne({ email: req.user.email });
  if (!user.isVerified) {
    return res
      .status(403)
      .json({ message: "Please verify your email to access this resource." });
  }
  next();
}

// This middleware checks if the user's email is verified before allowing access to certain routes. If the email is not verified, it sends a 403 response with a message indicating that email verification is required.
// It uses the `req.user` object, which is populated by a previous middleware (like `verifyToken`), to check the user's email and verification status in the database.
