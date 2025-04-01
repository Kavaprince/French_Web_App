import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// This will help us connect to the database
import db from "../db/connection.js";
import { generateVerificationToken } from "../helpers/tokenUtils.js"; // This is a helper function to generate tokens
import { sendVerificationEmail } from "../helpers/emailsenderUtils.js";
// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";
import dotenv from "dotenv";
//npm i dotenv
dotenv.config({ path: "./config.env" });

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const userRoutes = express.Router();

// get a list of all the users.
userRoutes.get("/users/all", async (req, res) => {
  let collection = await db.collection("users");
  let results = await collection.find({}).toArray();
  res.send(results).status(200);
});

// get users by topic ID
/*userRoutes.get("/userszes/topic/:topicId", async (req, res) => {
  let collection = await db.collection("users");
  let query = { topicId: new ObjectId(req.params.topicId) };
  let results = await collection.find(query).toArray();
  res.send(results).status(200);
});*/

//get a single user by id
userRoutes.get("/user/:id", async (req, res) => {
  let collection = await db.collection("users");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});

// Route to get a user by their username
userRoutes.get("/user/username/:username", async (req, res) => {
  try {
    const { username } = req.params; // Extract username from the URL parameters
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user); // Send the user data if found
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching user" });
  }
});

//create a new user
// create a new user
userRoutes.post("/user/create", async (req, res) => {
  try {
    // Check if the email is already taken.
    const takenEmail = await db
      .collection("users")
      .findOne({ email: req.body.email });
    if (takenEmail) {
      return res.status(400).json({ message: "The email is taken" });
    }

    // Hash password and create the user object.
    const hashedPassword = await bcrypt.hash(req.body.password, 20);
    let user = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role || "User", // Default to "User"
      isVerified: false,
      score: 0,
      createdAt: new Date(),
    };

    // Generate verification token and attach it.
    const verificationToken = generateVerificationToken(user.email);
    user.verificationToken = verificationToken;

    // Insert the user into the database.
    let collection = await db.collection("users");
    let result = await collection.insertOne(user);

    // Send the verification email.
    await sendVerificationEmail(user);

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error creating user" });
  }
});

// update users by id
userRoutes.patch("/user/update/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const updates = {
      $set: {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      },
    };

    let collection = await db.collection("users");
    let result = await collection.updateOne(query, updates);
    res.status(200).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating record");
  }
});

// Delete users by id
userRoutes.delete("/user/delete/:id", async (req, res) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };

    const collection = db.collection("users");
    let result = await collection.deleteOne(query);

    res.send(result).status(200);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting record");
  }
});

// Login a new user
userRoutes.post("/user/login", async (req, res) => {
  try {
    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });

    if (user) {
      let confirmation = await bcrypt.compare(req.body.password, user.password);
      if (confirmation) {
        if (req.body.role === user.role) {
          const token = jwt.sign(user, process.env.SECRETKEY, {
            expiresIn: "3h",
          });
          res.json({ success: true, token });
        } else {
          res.json({ success: false, message: "Incorrect role" });
        }
      } else {
        res.json({ success: false, message: "Incorrect Password" });
      }
    } else {
      res.json({ success: false, message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error logging in" });
  }
});

userRoutes.get("/verify-email", async (req, res) => {
  try {
    const token = req.query.token; // Extract token from query parameters
    const decoded = jwt.verify(token, process.env.SECRETKEY); // Verify and decode the token

    const user = await db.collection("users").findOne({ email: decoded.email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found or token invalid." });
    }

    // Mark the user's email as verified
    await db
      .collection("users")
      .updateOne(
        { email: decoded.email },
        { $set: { isVerified: true, verificationToken: null } }
      );

    res
      .status(200)
      .json({ message: "Your email has been verified successfully!" });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid or expired token." });
  }
});

export default userRoutes;
