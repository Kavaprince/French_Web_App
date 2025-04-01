import express from "express";
import { ObjectId } from "mongodb";
import db from "../db/connection.js";
import { verifyToken } from "../middleware/authmiddleware.js";
import { verifyEmailMiddleware } from "../middleware/verifyEmail.js";
import {
  normalize,
  validateSubmissionInputs,
  calculateCorrectCount,
} from "../helpers/quizUtils.js";
import { submitQuizAnswer } from "../controllers/quizSubmissionController.js";

const submissionRoutes = express.Router();

// Route for submitting quiz answers and comparing with correct answers
submissionRoutes.post(
  "/quiz/submit",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      const { quizId, answers, correctAnswer } = req.body;
      const userId = req.user._id;
      const result = await submitQuizAnswer(
        userId,
        quizId,
        answers,
        correctAnswer
      );
      res.status(200).json(result);
    } catch (error) {
      const status =
        error.message.includes("maximum") || error.message.includes("already")
          ? 400
          : 500;
      res.status(status).json({ message: error.message, error: error.message });
    }
  }
);

// Get all user submissions (with pagination)
submissionRoutes.get(
  "/quiz/submissions",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      const userId = req.user._id;
      const collection = await db.collection("quiz_submissions");

      const { page = 1, limit = 10 } = req.query;
      const submissions = await collection
        .find({ userId: new ObjectId(userId) })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .toArray();

      const totalSubmissions = await collection.countDocuments({
        userId: new ObjectId(userId),
      });

      res.status(200).json({
        submissions,
        total: totalSubmissions,
        page: parseInt(page),
        limit: parseInt(limit),
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving submissions" });
    }
  }
);

// Get a specific submission
submissionRoutes.get(
  "/quiz/submission/:id",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      const submissionId = req.params.id;

      if (!ObjectId.isValid(submissionId)) {
        return res
          .status(400)
          .json({ message: `Invalid submission ID: ${submissionId}` });
      }

      const collection = await db.collection("quiz_submissions");
      const submission = await collection.findOne({
        _id: new ObjectId(submissionId),
      });

      if (!submission) {
        return res
          .status(404)
          .json({ message: `Submission with ID ${submissionId} not found` });
      }

      res.status(200).json(submission);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error retrieving submission" });
    }
  }
);

// Route for providing feedback on a quiz submission
submissionRoutes.post(
  "/quiz/feedback",
  verifyToken,
  verifyEmailMiddleware,
  async (req, res) => {
    try {
      const { submissionId, feedback } = req.body;

      const collection = await db.collection("quiz_submissions");

      // Update submission with feedback
      const result = await collection.updateOne(
        { _id: new ObjectId(submissionId) },
        { $set: { feedback } }
      );

      res
        .status(200)
        .json({ message: "Feedback provided successfully", result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error providing feedback" });
    }
  }
);

export default submissionRoutes;
