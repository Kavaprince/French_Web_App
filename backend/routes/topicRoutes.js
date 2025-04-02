import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This help convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";
import { verifyToken } from "../middleware/authmiddleware.js";
import { verifyEmailMiddleware } from "../middleware/verifyEmail.js";
import multer from "multer";
import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
//npm i dotenv
dotenv.config({ path: "./config.env" });

// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.

//const upload = multer({ dest: "uploads/audio/" }); // Save audio files to "uploads/audio/"
const storage = multer.memoryStorage(); // Store files in memory for processing
const upload = multer({ storage: storage }); // Use memory storage for audio files
const storageGCP = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS, // Dynamically fetch path from config.env
});
// Initialize Google Cloud Storage
const bucketName = "my-first-mern-bucket"; // Replace with your bucket name

const topicRoutes = express.Router();

// get a list of all the topics.
topicRoutes.get(
  "/topics/all",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      const collection = await db.collection("topics");
      const results = await collection.find({}).toArray();

      // Format the response to include audio file URLs
      const formattedResults = results.map((topic) => ({
        ...topic,
        audioFile: topic.audio ? topic.audio.path : null, // Include public URLs for audio files
      }));

      res.status(200).send(formattedResults);
    } catch (err) {
      console.error("Error fetching topics:", err);
      res.status(500).send({ message: "Error fetching topics." });
    }
  }
);

//get a single topics by id
topicRoutes.get(
  "/topic/:id",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      const collection = await db.collection("topics");
      const query = { _id: new ObjectId(req.params.id) };
      const result = await collection.findOne(query);

      if (!result) {
        return res.status(404).send({ message: "Topic not found" });
      }

      res.status(200).json({
        topic: result,
        audioFile: result.audio
          ? result.audio.path // Use the Google Cloud Storage URL stored in the database
          : null,
      });
    } catch (err) {
      console.error("Error fetching topic:", err);
      res.status(500).send({ message: "Error fetching topic." });
    }
  }
);

// Updated route to upload audio file to Google Cloud Storage
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

      // Upload audio file to Google Cloud Storage
      const file = req.file;
      if (!file) {
        return res.status(400).send({ message: "Audio file is required." });
      }

      const blob = storageGCP.bucket(bucketName).file(file.originalname);
      await blob.save(file.buffer, {
        metadata: {
          contentType: file.mimetype,
        },
      });

      console.log("Audio uploaded to Google Cloud Storage:", file.originalname);

      // Create document for the topic
      const newDocument = {
        title: req.body.title,
        learning_objectives: req.body.learning_objectives,
        description: req.body.description,
        examples: req.body.examples,
        tips: req.body.tips,
        audio: {
          filename: file.originalname,
          path: `https://storage.googleapis.com/${bucketName}/${file.originalname}`, // Public URL of the uploaded file
        },
        createdAt: new Date(),
        createdBy: {
          id: req.user._id,
          username: req.user.username,
        },
      };

      const topicCollection = await db.collection("topics");
      const result = await topicCollection.insertOne(newDocument);
      console.log("Topic created by admin:", req.user.username);
      res.status(200).send(result);
    } catch (err) {
      console.error("Error adding record or uploading audio:", err);
      res
        .status(500)
        .send({ message: "Failed to add record or upload audio." });
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
    try {
      console.log("Request params ID:", req.params.id); // Ensure ID is received
      console.log("Request body:", req.body); // Ensure body fields are received
      console.log("Request file:", req.file); // Ensure audio file is received

      // Ensure the user updating the topic is an admin
      if (req.user.role !== "Admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Only admins can update topics." });
      }

      if (!req.params.id) {
        return res
          .status(400)
          .json({ message: "Topic ID is missing in the request." });
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

      // If there's a new audio file, upload it to Google Cloud Storage
      if (req.file) {
        const file = req.file;
        const blob = storageGCP.bucket(bucketName).file(file.originalname);
        await blob.save(file.buffer, {
          metadata: {
            contentType: file.mimetype,
          },
        });

        console.log(
          "Audio uploaded to Google Cloud Storage:",
          file.originalname
        );

        // Update audio field with public URL
        updates.$set.audio = {
          filename: file.originalname,
          path: `https://storage.googleapis.com/${bucketName}/${file.originalname}`, // Public URL of the uploaded file
        };
      }

      // Perform update in the database
      const topicCollection = await db.collection("topics");
      const result = await topicCollection.updateOne(query, updates);

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: "Topic not found or no changes made." });
      }

      console.log("Topic updated by admin:", req.user.username);
      console.log("Topic updated on:", new Date());

      res.status(200).json({ message: "Topic updated successfully", result });
    } catch (err) {
      console.error("Error updating record:", err);
      res.status(500).json({ message: "Error updating record." });
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

      // Fetch the topic to check for an associated audio file
      const topic = await collection.findOne(query);
      if (!topic) {
        return res.status(404).send({ message: "Topic not found." });
      }

      // Delete the audio file from Google Cloud Storage if it exists
      if (topic.audio && topic.audio.path) {
        const fileName = topic.audio.filename;
        const file = storageGCP.bucket(bucketName).file(fileName);
        await file.delete();
        console.log("Audio file deleted from Google Cloud Storage:", fileName);
      }

      // Delete the topic from the database
      const result = await collection.deleteOne(query);
      if (result.deletedCount === 0) {
        return res
          .status(404)
          .send({ message: "Topic not found or already deleted." });
      }

      res.status(200).send({ message: "Topic deleted successfully." });
    } catch (err) {
      console.error("Error deleting topic:", err);
      res.status(500).send({ message: "Error deleting topic." });
    }
  }
);

export default topicRoutes;
