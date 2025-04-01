import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { submitQuiz } from "@/api";

// Simple array shuffle algorithm.
function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function AnswerQuestion({ quiz, onCancel }) {
  const [selectedOption, setSelectedOption] = useState("");
  const [shortAnswer, setShortAnswer] = useState("");

  // For Matching: store the user's selection for each left item (pairA) by index.
  const [matchingSelection, setMatchingSelection] = useState([]);
  // Right items (pairB) from the quiz, shuffled.
  const [shuffledRightItems, setShuffledRightItems] = useState([]);
  // Flag to indicate that matching answers have been submitted.
  const [matchingSubmitted, setMatchingSubmitted] = useState(false);

  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0); // Track user's current score
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Initialize matching selections and shuffle right items whenever the quiz changes.
  useEffect(() => {
    if (quiz.type === "Matching" && Array.isArray(quiz.correctAnswer)) {
      // For each pair, display its left item (pairA).
      setMatchingSelection(new Array(quiz.correctAnswer.length).fill(""));
      // Extract and shuffle the right items from quiz.correctAnswer.
      const rightItems = quiz.correctAnswer.map((pair) => pair.pairB);
      setShuffledRightItems(shuffleArray(rightItems));
      setMatchingSubmitted(false);
    }
  }, [quiz]);

  // Handler for when a matching option is selected from a dropdown.
  const handleMatchingSelect = (index, value) => {
    const updated = [...matchingSelection];
    updated[index] = value;
    setMatchingSelection(updated);
  };

  // Updated function to return inline style for a select element.
  // New default "normal" style uses white background with black text.
  const getSelectStyle = (index) => {
    // If not submitted yet, return normal style.
    if (!matchingSubmitted) {
      return { backgroundColor: "white", color: "black" };
    }
    const correctValue = quiz.correctAnswer[index].pairB.trim().toLowerCase();
    const selectedValue = matchingSelection[index]?.trim().toLowerCase();
    if (!selectedValue) {
      return { backgroundColor: "white", color: "black" };
    }
    return selectedValue === correctValue
      ? { backgroundColor: "green", color: "white" }
      : { backgroundColor: "red", color: "white" };
  };

  const handleSubmit = async () => {
    const normalize = (str) => str?.trim().toLowerCase();
    let answer;

    if (quiz.type === "Multiple choice") {
      answer = normalize(selectedOption);
    } else if (quiz.type === "Short answer") {
      answer = normalize(shortAnswer);
    } else if (quiz.type === "Matching") {
      // Check if at least one dropdown has a value.
      if (
        matchingSelection.every(
          (selection) => !selection || selection.trim() === ""
        )
      ) {
        setMessage("Please select at least one match before submitting.");
        return;
      }
      // Build an array of objects where each object includes the original left item
      // and the user’s selected (normalized) matching value.
      answer = quiz.correctAnswer.map((pair, index) => ({
        pairA: pair.pairA, // keep the left item as provided
        pairB: normalize(matchingSelection[index] || ""),
      }));
      setMatchingSubmitted(true); // Mark that matching answers were submitted so styling can update.
    }

    // For MCQ/Short Answer, check that answer isn't empty.
    if (
      (quiz.type === "Multiple choice" || quiz.type === "Short answer") &&
      !answer
    ) {
      setMessage("Please provide an answer before submitting.");
      return;
    }

    try {
      setIsSubmitting(true); // Prevent multiple submissions
      const result = await submitQuiz(quiz._id, answer, quiz.correctAnswer);

      // Disable inputs if the answer is correct or maximum attempts (3) are reached.
      if (result.correct || result.attempt >= 3) {
        setIsCompleted(true);
      }

      // Provide feedback based on the result.
      if (result.attempt >= 3 && !result.correct) {
        setMessage("You have reached the maximum number of attempts.");
      } else {
        setMessage(
          result.correct
            ? `Correct! You completed the quiz in ${result.attempt} attempts.`
            : `Incorrect. Try again! (Attempt ${result.attempt} of 3)`
        );
      }

      // Update user score if provided.
      if (result.score !== undefined) {
        setScore(result.score);
      }
    } catch (error) {
      if (error.response?.status === 400) {
        setMessage(error.response.data.message || "Bad Request.");
        setIsCompleted(true);
      } else {
        setMessage("Error submitting quiz. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }

    // Clear the feedback message after 5 seconds.
    setTimeout(() => setMessage(""), 5000);
  };

  return (
    <div className="answer-question-form p-6 bg-white shadow-md rounded-lg text-left mb-4 animate-slide-up">
      {/* Quiz Title and Description */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
        <p className="text-gray-600">{quiz.description}</p>
      </div>

      {/* Multiple Choice Question */}
      {quiz.type === "Multiple choice" && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Options:</h3>
          <RadioGroup
            className="list-disc list-inside ml-5 space-y-2"
            value={selectedOption}
            onValueChange={(value) => setSelectedOption(value)}
            disabled={isCompleted}
          >
            {quiz.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`option-${index}`}
                  disabled={isCompleted}
                />
                <Label htmlFor={`option-${index}`} className="text-gray-700">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Short Answer Question */}
      {quiz.type === "Short answer" && (
        <div className="mb-4">
          <Label htmlFor="shortAnswer" className="font-semibold text-gray-700">
            Your Answer:
          </Label>
          <Textarea
            id="shortAnswer"
            value={shortAnswer}
            onChange={(e) => setShortAnswer(e.target.value)}
            className="w-full mt-2 p-2 border rounded-md"
            disabled={isCompleted}
          />
        </div>
      )}

      {/* Matching Question */}
      {quiz.type === "Matching" && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Match the following pairs:
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {/* Left Column: Fixed Items */}
            <div>
              <h4 className="font-bold">Items</h4>
              {quiz.correctAnswer.map((pair, index) => (
                <div
                  key={index}
                  className="mb-2 p-2 border border-gray-300 rounded"
                >
                  {pair.pairA}
                </div>
              ))}
            </div>
            {/* Right Column: Randomized Selections */}
            <div>
              <h4 className="font-bold">Select Match</h4>
              {quiz.correctAnswer.map((pair, index) => (
                <div key={index} className="mb-2">
                  <select
                    value={matchingSelection[index] || ""}
                    onChange={(e) =>
                      handleMatchingSelect(index, e.target.value)
                    }
                    disabled={isCompleted}
                    style={getSelectStyle(index)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Select match</option>
                    {shuffledRightItems.map((option, idx) => (
                      <option key={idx} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-between mt-4">
        <Button onClick={handleSubmit} disabled={isSubmitting || isCompleted}>
          {isSubmitting ? "Submitting..." : "Submit Answer"}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>

      {/* Feedback Message */}
      {message && <p className="text-green-500 mt-4">{message}</p>}

      {/* Display Current Score */}
      <div className="mt-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Your Current Score: {score}
        </h3>
      </div>
    </div>
  );
}
