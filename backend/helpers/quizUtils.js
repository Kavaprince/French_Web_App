// helpers/quizUtils.js

export const normalize = (str) => str?.trim().toLowerCase();

export const validateSubmissionInputs = ({
  quizId,
  answers,
  correctAnswer,
  userId,
}) => {
  if (!userId) {
    return { valid: false, message: "User ID is missing in the request." };
  }
  if (!quizId || !correctAnswer) {
    return { valid: false, message: "Missing required fields." };
  }
  if (!answers || (Array.isArray(answers) && answers.length === 0)) {
    return { valid: false, message: "No answers provided." };
  }
  return { valid: true };
};

export const calculateCorrectCount = (correctAnswer, answers) => {
  // If both answers and correctAnswer are arrays (i.e., Matching type)
  if (Array.isArray(correctAnswer) && Array.isArray(answers)) {
    const count = correctAnswer.reduce((c, correctPair, index) => {
      const userPair = answers[index] || {};
      return normalize(correctPair.pairA) === normalize(userPair.pairA) &&
        normalize(correctPair.pairB) === normalize(userPair.pairB)
        ? c + 1
        : c;
    }, 0);
    // Award points equal to the total number of pairs only when all pairs are correct.
    return count === correctAnswer.length ? correctAnswer.length : 0;
  } else if (!Array.isArray(correctAnswer) && !Array.isArray(answers)) {
    // For non-matching types (MCQ and Short Answer)
    return normalize(correctAnswer) === normalize(answers) ? 1 : 0;
  }

  // In case of type mismatch, default to 0
  return 0;
};
