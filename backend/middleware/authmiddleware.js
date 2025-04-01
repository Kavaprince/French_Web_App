import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" }); // Load environment variables from config.env

export function verifyToken(req, res, next) {
  // Extract the Bearer token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  console.log("Token received:", token);
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied. No token provided." });
  }

  try {
    // Verify the token
    const verified = jwt.verify(token, process.env.SECRETKEY); // SECRETKEY is used to sign and verify tokens
    req.user = {
      _id: verified._id, // User ID
      username: verified.username, // Username
      email: verified.email, // Email
      role: verified.role, // User's role (e.g., Admin, User)
    };
    console.log("Verified user:", req.user);
    next(); // Proceed to the next middleware or route
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
}
