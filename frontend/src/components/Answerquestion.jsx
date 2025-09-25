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
  const [showExplanation, setShowExplanation] = useState(false);
  const [matchingSelection, setMatchingSelection] = useState([]);
  const [shuffledRightItems, setShuffledRightItems] = useState([]);
  const [message, setMessage] = useState("");
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Shuffle right-side items (pairB) on component mount
  useEffect(() => {
    if (quiz.type === "Matching") {
      const rightItems = quiz.correctAnswer.map((pair) => pair.pairB);
      setShuffledRightItems(shuffleArray(rightItems));
    }
  }, [quiz]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      let answer;

      if (quiz.type === "Matching") {
        answer = quiz.correctAnswer.map((pair, index) => ({
          pairA: pair.pairA,
          pairB: matchingSelection[index] || "",
        }));
      } else {
        answer = selectedOption || shortAnswer;
      }

      const result = await submitQuiz(quiz._id, answer, quiz.correctAnswer);

      if (result.correct || result.attempt >= 3) {
        setIsCompleted(true);
        setShowExplanation(true);
      }

      setMessage(
        result.correct
          ? "Correct answer!"
          : "Try again! you have " + (3 - result.attempt) + " attempts left."
      );
      if (result.score) setScore(result.score);
    } catch (error) {
      setMessage("Error submitting quiz.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="answer-question-form p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800">{quiz.title}</h2>
      <p className="text-gray-600 mb-4">{quiz.description}</p>

      {/* Multiple Choice */}
      {quiz.type === "Multiple choice" && (
        <div className="mb-4">
          <RadioGroup
            value={selectedOption}
            onValueChange={(value) => setSelectedOption(value)}
            disabled={isCompleted}
          >
            {quiz.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Short Answer */}
      {quiz.type === "Short answer" && (
        <Textarea
          className="mb-4"
          value={shortAnswer}
          onChange={(e) => setShortAnswer(e.target.value)}
          disabled={isCompleted}
        />
      )}

      {/* Matching Question */}
      {quiz.type === "Matching" && (
        <div className="mb-4">
          {quiz.correctAnswer.map((pair, index) => (
            <div key={index} className="mb-2">
              <Label className="block mb-1">{pair.pairA}</Label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={matchingSelection[index] || ""}
                onChange={(e) => {
                  const newSelection = [...matchingSelection];
                  newSelection[index] = e.target.value;
                  setMatchingSelection(newSelection);
                }}
                disabled={isCompleted}
              >
                <option value="">Select match</option>
                {shuffledRightItems.map((item, i) => (
                  <option key={i} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      <Button onClick={handleSubmit} disabled={isSubmitting || isCompleted}>
        Submit Answer
      </Button>

      {message && <p className="mt-4 text-green-500">{message}</p>}

      {/* Explanation */}
      {showExplanation ? (
        <div className="mt-4 p-4 bg-gray-100 rounded border">
          <strong>Explanation:</strong>
          <p className="whitespace-pre-line">{quiz.explanation}</p>
        </div>
      ) : (
        isCompleted && (
          <Button onClick={() => setShowExplanation(true)} className="mt-4">
            Show Explanation
          </Button>
        )
      )}
    </div>
  );
}
