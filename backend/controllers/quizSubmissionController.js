// controllers/quizSubmissionController.js

import { ObjectId } from "mongodb";
import db from "../db/connection.js";
import {
  normalize,
  validateSubmissionInputs,
  calculateCorrectCount,
} from "../helpers/quizUtils.js";

export const submitQuizAnswer = async (
  userId,
  quizId,
  answers,
  correctAnswer
) => {
  const validation = validateSubmissionInputs({
    quizId,
    answers,
    correctAnswer,
    userId,
  });
  if (!validation.valid) {
    throw new Error(validation.message);
  }

  const submissionCollection = await db.collection("quiz_submissions");
  const userSubmissions = await submissionCollection
    .find({
      quizId: new ObjectId(quizId),
      userId: new ObjectId(userId),
    })
    .toArray();

  const existingAttempts = userSubmissions.length;
  const completed = userSubmissions.some((submission) => submission.correct);

  if (completed) {
    throw new Error("You have already completed this quiz successfully.");
  }

  if (existingAttempts >= 3) {
    throw new Error(
      "You have reached the maximum number of attempts for this quiz."
    );
  }

  const correctCount = calculateCorrectCount(correctAnswer, answers);
  const attempt = existingAttempts + 1;
  const submission = {
    quizId: new ObjectId(quizId),
    userId: new ObjectId(userId),
    answers,
    correct:
      correctCount ===
      (Array.isArray(correctAnswer) ? correctAnswer.length : 1),
    attempt,
    submittedAt: new Date(),
  };

  await submissionCollection.insertOne(submission);

  const userCollection = await db.collection("users");
  const scoreIncrement = correctCount;
  if (scoreIncrement > 0) {
    await userCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $inc: { score: scoreIncrement } }
    );
  }

  const updatedUser = await userCollection.findOne({
    _id: new ObjectId(userId),
  });

  return {
    message: submission.correct
      ? "Correct! You have successfully completed the quiz."
      : `Incorrect. Try again! (Attempt ${attempt} of 3)`,
    correctAnswers: correctCount,
    totalQuestions: Array.isArray(correctAnswer) ? correctAnswer.length : 1,
    score: updatedUser.score,
    correct: submission.correct,
    attempt,
  };
};
