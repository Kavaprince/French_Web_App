import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";
import { verifyToken } from "../middleware/authmiddleware.js";
import { verifyEmailMiddleware } from "../middleware/verifyEmail.js";
import multer from "multer";

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.

const upload = multer({ dest: "uploads/audio/" }); // Save audio files to "uploads/audio/"
const topicRoutes = express.Router();

// get a list of all the topics.
topicRoutes.get(
  "/topics/all",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    let collection = await db.collection("topics");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
  }
);

//get a single topics by id
topicRoutes.get(
  "/topic/:id",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    const collection = await db.collection("topics");
    const query = { _id: new ObjectId(req.params.id) };
    const result = await collection.findOne(query);

    if (!result) return res.status(404).send("Topic not found");

    res.status(200).json({
      topic: result,
      audioFile: result.audio
        ? `http://localhost:3000/${result.audio.path}`
        : null,
    });
  }
);

//Create topics
// Create topic
topicRoutes.post(
  "/topics/create",
  verifyToken,
  verifyEmailMiddleware,
  upload.single("audio"),
  async (req, res) => {
    try {
      // Ensure the user creating the topic is an admin
      if (req.user.role !== "Admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Only admins can create topics." });
      }

      const newDocument = {
        title: req.body.title, // The title of the language-learning topic
        learning_objectives: req.body.learning_objectives, // Key objectives for learners
        description: req.body.description, // A detailed explanation of the topic
        examples: req.body.examples, // Sample sentences or usage examples
        tips: req.body.tips, // Additional tips or cultural notes
        audio: {
          filename: req.file.originalname,
          path: req.file.path,
        },
        createdAt: new Date(),
        createdBy: {
          id: req.user._id, // Admin's ID from the token
          username: req.user.username, // Admin's username from the token
        },
      };

      let topicCollection = await db.collection("topics");
      let result = await topicCollection.insertOne(newDocument);
      console.log("Topic created by admin:", req.user.username);
      console.log("Audio uploaded:", req.file.originalname);
      res.status(200).send(result);
    } catch (err) {
      console.error("Error adding record:", err);
      res.status(500).send("Error adding record");
    }
  }
);

// update topics by id
topicRoutes.patch(
  "/topic/update/:id",
  verifyToken,
  verifyEmailMiddleware,
  upload.single("audio"),

  async (req, res) => {
    topicRoutes.patch(
      "/topic/update/:id",
      verifyToken,
      upload.single("audio"),
      async (req, res) => {
        console.log("Request params ID:", req.params.id); // Ensure ID is received
        console.log("Request body:", req.body); // Ensure body fields are received
        console.log("Request file:", req.file); // Ensure audio file is received

        if (!req.params.id) {
          return res
            .status(400)
            .json({ message: "Topic ID is missing in the request." });
        }

        // Remaining logic for updates...
      }
    );

    try {
      // Ensure the user updating the topic is an admin
      if (req.user.role !== "Admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Only admins can update topics." });
      }

      const query = { _id: new ObjectId(req.params.id) };

      // Prepare updates
      const updates = {
        $set: {
          title: req.body.title, // The title of the language-learning topic
          learning_objectives: req.body.learning_objectives, // Key objectives for learners
          description: req.body.description, // A detailed explanation of the topic
          examples: req.body.examples, // Sample sentences or usage examples
          tips: req.body.tips, // Additional tips or cultural notes
          updatedAt: new Date(),
          updatedBy: {
            id: req.user._id, // Admin's ID from the token
            username: req.user.username, // Admin's username from the token
          },
        },
      };

      // If there's a new audio file, add it to updates
      if (req.file) {
        updates.$set.audio = {
          filename: req.file.originalname,
          path: req.file.path,
        };
      }

      // Perform update
      let collection = await db.collection("topics");
      let result = await collection.updateOne(query, updates);
      console.log("Topic updated by admin:", req.user.username);
      console.log("Topic updated on:", new Date());

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: "Topic not found or no changes made." });
      }

      res.status(200).json({ message: "Topic updated successfully", result });
    } catch (err) {
      console.error("Error updating record:", err);
      res.status(500).json({ message: "Error updating record" });
    }
  }
);

// Delete topics by id
topicRoutes.delete(
  "/topic/delete/:id",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      const query = { _id: new ObjectId(req.params.id) };

      const collection = db.collection("topics");
      let result = await collection.deleteOne(query);

      res.send(result).status(200);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting record");
    }
  }
);

export default topicRoutes;
