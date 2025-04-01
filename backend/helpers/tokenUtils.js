// helpers/tokenUtils.js
import jwt from "jsonwebtoken";

export const generateVerificationToken = (email) => {
  // The token expires in 1 day. Adjust expiration as needed.
  return jwt.sign({ email }, process.env.SECRETKEY, { expiresIn: "1d" });
};
