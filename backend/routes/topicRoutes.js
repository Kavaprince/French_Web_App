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
/*const googleCredentials = JSON.parse(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
);

const storageGCP = new Storage({
  credentials: googleCredentials, // Provide the credentials directly
});*/
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
  upload.array("audio", 20), // Allow up to 20 audio files
  async (req, res) => {
    try {
      // Log user role and request details
      console.log("Request received. User role:", req.user.role);
      console.log("Request body:", req.body);
      console.log("Request files:", req.files);

      // Check user role
      if (req.user.role !== "Admin") {
        console.log("Access denied: User is not an Admin.");
        return res
          .status(403)
          .json({ message: "Access denied. Only admins can create topics." });
      }

      const files = req.files;
      const subtitles = req.body.subtitle; // Array of subtitles
      const translations = req.body.translation; // Array of translations

      // Validate file and field requirements
      if (!files || files.length === 0) {
        console.log("Validation failed: No audio files provided.");
        return res.status(400).send({ message: "Audio files are required." });
      }
      if (
        !subtitles ||
        !translations ||
        subtitles.length !== files.length ||
        translations.length !== files.length
      ) {
        console.log(
          "Validation failed: Subtitles and translations do not match the number of audio files."
        );
        console.log("Subtitles received:", subtitles);
        console.log("Translations received:", translations);
        return res.status(400).send({
          message:
            "Subtitles and translations must be provided for each audio file.",
        });
      }

      const audioDetails = [];

      // Process each file for upload
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const folderPath = "french-web-app/audio";
        const filePath = `${folderPath}/${file.originalname}`;

        console.log(
          `Uploading file ${file.originalname} to Google Cloud Storage.`
        );

        const bucket = storageGCP.bucket(bucketName);
        const blob = bucket.file(filePath);
        const blobStream = blob.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
        });

        try {
          await new Promise((resolve, reject) => {
            blobStream.on("error", (err) => {
              console.error(`Error uploading file ${file.originalname}:`, err);
              reject(err);
            });
            blobStream.on("finish", () => {
              const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
              console.log(
                `File uploaded successfully: ${file.originalname}. Public URL: ${publicUrl}`
              );
              audioDetails.push({
                filename: file.originalname,
                url: publicUrl,
                subtitle: subtitles[i],
                translation: translations[i],
              });
              resolve();
            });
            blobStream.end(file.buffer);
          });
        } catch (uploadError) {
          console.error(
            `Failed to upload file ${file.originalname} to Google Cloud Storage.`,
            uploadError
          );
          throw uploadError;
        }
      }

      // Prepare document for database insertion
      const newDocument = {
        title: req.body.title,
        learning_objectives: req.body.learning_objectives,
        description: req.body.description,
        examples: req.body.examples,
        tips: req.body.tips,
        audio: audioDetails, // Store audio details with subtitles and translations
        createdAt: new Date(),
        createdBy: {
          id: req.user._id,
          username: req.user.username,
        },
      };

      console.log("Document to be inserted into the database:", newDocument);

      // Insert the new document into the database
      const topicCollection = await db.collection("topics");
      const result = await topicCollection.insertOne(newDocument);

      console.log("Topic created successfully by admin:", req.user.username);
      res.status(200).send({
        message: "Topic created successfully.",
        data: result,
      });
    } catch (err) {
      console.error("Error creating topic or uploading audio files:", err);
      res.status(500).send({
        message: "Failed to create topic or upload audio files.",
        error: err.message, // Include the specific error message for easier debugging
      });
    }
  }
);

topicRoutes.patch(
  "/topic/update/:id",
  verifyToken,
  verifyEmailMiddleware,
  upload.array("audio", 20), // Support up to 20 audio files
  async (req, res) => {
    try {
      console.log("[INFO] Patch request received.");
      console.log("[INFO] Request params ID:", req.params.id);
      console.log("[INFO] Request body:", req.body);
      console.log("[INFO] Number of files uploaded:", req.files?.length || 0);

      // Access control: Verify the user's role
      if (req.user.role !== "Admin") {
        console.log("[ERROR] Access denied: User is not an Admin.");
        return res
          .status(403)
          .json({ message: "Access denied. Only admins can update topics." });
      }

      // Validate the topic ID
      if (!req.params.id) {
        console.log(
          "[ERROR] Validation failed: Missing Topic ID in the request."
        );
        return res
          .status(400)
          .json({ message: "Topic ID is missing in the request." });
      }

      const query = { _id: new ObjectId(req.params.id) };
      console.log("[INFO] Query to find topic:", query);

      // Set updates for non-audio fields
      const updates = {
        $set: {
          title: req.body.title,
          learning_objectives: req.body.learning_objectives,
          description: req.body.description,
          examples: req.body.examples,
          tips: req.body.tips,
          updatedAt: new Date(),
          updatedBy: {
            id: req.user._id,
            username: req.user.username,
          },
          // Ensure subtitle and translation are updated even without audio uploads
          subtitle: req.body.subtitle,
          translation: req.body.translation,
        },
      };
      console.log("[INFO] Updates for non-audio fields:", updates.$set);

      // Check if audio files are provided
      if (req.files && req.files.length > 0) {
        const files = req.files;
        const subtitles = Array.isArray(req.body.subtitle)
          ? req.body.subtitle
          : [req.body.subtitle]; // Ensure subtitle is an array
        const translations = Array.isArray(req.body.translation)
          ? req.body.translation
          : [req.body.translation]; // Ensure translation is an array

        console.log("[INFO] Subtitles received:", subtitles);
        console.log("[INFO] Translations received:", translations);

        // Validate audio files against subtitles/translations
        if (
          subtitles.length !== files.length ||
          translations.length !== files.length
        ) {
          console.log(
            "[ERROR] Validation failed: Subtitles and translations do not match the number of audio files."
          );
          return res.status(400).send({
            message:
              "Subtitles and translations must be provided for each audio file.",
          });
        }

        const audioDetails = [];
        console.log("[INFO] Starting file upload process.");

        // Upload each audio file
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const folderPath = "french-web-app/audio";
          const filePath = `${folderPath}/${file.originalname}`;

          console.log(
            `[INFO] Uploading file ${file.originalname} to Google Cloud Storage.`
          );

          const bucket = storageGCP.bucket(bucketName);
          const blob = bucket.file(filePath);

          try {
            await new Promise((resolve, reject) => {
              const blobStream = blob.createWriteStream({
                metadata: {
                  contentType: file.mimetype,
                },
              });
              blobStream.on("error", (err) => {
                console.error(
                  `[ERROR] Upload error for file ${file.originalname}:`,
                  err
                );
                reject(err);
              });
              blobStream.on("finish", () => {
                const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;
                console.log(
                  `[INFO] File uploaded successfully: ${file.originalname}. Public URL: ${publicUrl}`
                );
                audioDetails.push({
                  filename: file.originalname,
                  url: publicUrl,
                  subtitle: subtitles[i],
                  translation: translations[i],
                });
                resolve();
              });
              blobStream.end(file.buffer);
            });
          } catch (uploadError) {
            console.error(
              `[ERROR] Failed to upload file ${file.originalname} to Google Cloud Storage.`,
              uploadError
            );
            throw uploadError;
          }
        }

        console.log(
          "[INFO] File upload process completed. Audio details:",
          audioDetails
        );

        // Add audio details to updates
        updates.$set.audio = audioDetails;
      } else {
        console.log("[INFO] No new audio files uploaded.");
      }

      console.log("[INFO] Document to be updated:", updates);

      // Perform the database update
      const topicCollection = await db.collection("topics");
      const result = await topicCollection.updateOne(query, updates);

      console.log("[INFO] Database update result:", result);

      if (result.matchedCount === 0) {
        console.log("[ERROR] No topic found or no changes made.");
        return res
          .status(404)
          .json({ message: "Topic not found or no changes made." });
      }

      console.log(
        "[SUCCESS] Topic updated successfully by admin:",
        req.user.username
      );
      res.status(200).json({ message: "Topic updated successfully", result });
    } catch (err) {
      console.error("[ERROR] Error updating topic:", err);
      res.status(500).json({
        message: "Error updating topic.",
        error: err.message, // Include specific error message for debugging
      });
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
        console.error("Topic not found for ID:", req.params.id);
        return res.status(404).send({ message: "Topic not found." });
      }

      // Delete the audio file from Google Cloud Storage if it exists
      if (topic.audio && topic.audio.path) {
        const filePath = `french-web-app/audio/${topic.audio.filename}`;
        const file = storageGCP.bucket(bucketName).file(filePath);
        await file.delete();
        console.log("Audio file deleted from Google Cloud Storage:", filePath);
      }

      // Delete the topic from the database
      const result = await collection.deleteOne(query);
      if (result.deletedCount === 0) {
        return res
          .status(404)
          .send({ message: "Topic not found or already deleted." });
      }

      console.log("Topic with ID:", req.params.id, "deleted successfully.");
      res.status(200).send({ message: "Topic deleted successfully." });
    } catch (err) {
      console.error(
        "Error deleting topic with ID:",
        req.params.id,
        "Error:",
        err
      );
      res.status(500).send({ message: "Error deleting topic." });
    }
  }
);

export default topicRoutes;
