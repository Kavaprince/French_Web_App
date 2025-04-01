import express from "express";

// This will help us connect to the database
import db from "../db/connection.js";

// This helps convert the id from string to ObjectId for the _id.
import { ObjectId } from "mongodb";
import { verifyToken } from "../middleware/authmiddleware.js";
import { verifyEmailMiddleware } from "../middleware/verifyEmail.js";
// router is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const quizRoutes = express.Router();

// get a list of all the quizzes.
quizRoutes.get(
  "/quizzes/all",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    let collection = await db.collection("quiz");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
  }
);

// get quizzes by topic ID
quizRoutes.get(
  "/quizzes/topic/:topicId",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    let collection = await db.collection("quiz");
    let query = { topicId: new ObjectId(req.params.topicId) };
    let results = await collection.find(query).toArray();
    res.send(results).status(200);
  }
);

// get a single quiz by id
quizRoutes.get(
  "/quiz/:id",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    let collection = await db.collection("quiz");
    let query = { _id: new ObjectId(req.params.id) };
    let result = await collection.findOne(query);

    if (!result) res.send("Not found").status(404);
    else res.send(result).status(200);
  }
);

// Create quiz
quizRoutes.post(
  "/quiz/create",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      // Ensure only admins can create quizzes
      if (req.user.role !== "Admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Only admins can create quizzes." });
      }

      const topicId = new ObjectId(req.body.topicId);
      let collection = await db.collection("topics");

      // Check if the topic exists
      let existingTopic = await collection.findOne({ _id: topicId });

      if (existingTopic) {
        // Create the quiz document
        const newDocument = {
          topicId: topicId,
          title: req.body.title,
          type: req.body.type, // e.g., "MCQ", "Coding"
          description: req.body.description,
          options: req.body.options, // Add options for quizzes like MCQs
          correctAnswer: req.body.correctAnswer, // Specify the correct answer
          explanation: req.body.explanation, // Explanation for the answer
          createdAt: new Date(),
          createdBy: {
            id: req.user._id, // Admin's ID from the token
            username: req.user.username, // Admin's username from the token
          },
        };

        let quizCollection = await db.collection("quiz");
        let result = await quizCollection.insertOne(newDocument);
        console.log(
          "Quiz created by admin:",
          req.user.username,
          "for topic:",
          existingTopic.title
        );
        res.status(200).json({ message: "Quiz created successfully", result });
      } else {
        res.status(404).json({ message: "Topic not found" });
      }
    } catch (err) {
      console.error("Error creating quiz:", err);
      res.status(500).json({ message: "Error creating quiz" });
    }
  }
);

// update quiz by id
quizRoutes.patch(
  "/quiz/update/:id",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      // Ensure only admins can update quizzes
      if (req.user.role !== "Admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Only admins can update quizzes." });
      }

      const query = { _id: new ObjectId(req.params.id) };
      const updates = {
        $set: {
          title: req.body.title,
          type: req.body.type, // e.g., "MCQ", "Coding"
          description: req.body.description,
          options: req.body.options, // Add options here for MCQs
          correctAnswer: req.body.correctAnswer, // Update the correct answer
          explanation: req.body.explanation, // Update the explanation
          updatedAt: new Date(),
          updatedBy: {
            id: req.user._id, // Admin's ID from the token
            username: req.user.username, // Admin's username from the token
          },
        },
      };

      let collection = await db.collection("quiz");
      let result = await collection.updateOne(query, updates);

      if (result.modifiedCount === 0) {
        return res
          .status(404)
          .json({ message: "Quiz not found or no changes made." });
      }

      res.status(200).json({ message: "Quiz updated successfully", result });
    } catch (err) {
      console.error("Error updating quiz:", err);
      res.status(500).json({ message: "Error updating quiz" });
    }
  }
);

// Delete quiz by id
quizRoutes.delete(
  "/quiz/delete/:id",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      const query = { _id: new ObjectId(req.params.id) };

      const collection = db.collection("quiz");
      let result = await collection.deleteOne(query);

      res.send(result).status(200);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error deleting record");
    }
  }
);

export default quizRoutes;
