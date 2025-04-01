import { useState } from "react";
import { createQuiz } from "@/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Addquestion({ onClose, selectedTopic }) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [explanation, setExplanation] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(""); // String for Short Answer and MCQ
  const [options, setOptions] = useState({
    optionA: "",
    optionB: "",
    optionC: "",
  }); // Options for MCQ
  const [matchingPairs, setMatchingPairs] = useState([]); // Array for Matching type
  const [pairA, setPairA] = useState("");
  const [pairB, setPairB] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Add a new pair for Matching type
  const addPair = () => {
    if (pairA.trim() !== "" && pairB.trim() !== "") {
      setMatchingPairs([...matchingPairs, { pairA, pairB }]);
      setPairA("");
      setPairB("");
    }
  };

  // Remove a pair by index from Matching type
  const removePair = (index) => {
    const updatedPairs = matchingPairs.filter((_, i) => i !== index);
    setMatchingPairs(updatedPairs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newQuestion = {
      topicId: selectedTopic._id,
      title,
      type,
      description,
      explanation,
      correctAnswer: type === "Matching" ? matchingPairs : correctAnswer, // Use correctAnswer for other types
      options: type === "Multiple choice" ? Object.values(options) : null, // Options for MCQ
    };
    try {
      const response = await createQuiz(newQuestion);
      console.log("Server response:", response);
      setMessage("Question created successfully!");
      setError("");
      setTitle("");
      setType("");
      setDescription("");
      setCorrectAnswer(type === "Matching" ? [] : ""); // Reset accordingly
      setMatchingPairs([]);
      setOptions({ optionA: "", optionB: "", optionC: "" });
      setExplanation("");
    } catch (error) {
      setError("Error creating question");
      setMessage("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm z-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-1/3 my-5 max-h-96 overflow-y-auto"
      >
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Add Question to</h2>
          <div>{selectedTopic?.title}</div>
        </div>

        <Label className="flex left-0 p-2 mb-1">Question Title:</Label>
        <Input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="create-question-input mb-2"
        />
        <Label className="flex left-0 p-2 mb-1">Type:</Label>
        <Select
          onValueChange={(value) => setType(value)}
          value={type}
          required
          className="mb-2"
        >
          <SelectTrigger className="create-question-input">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Multiple choice">Multiple choice</SelectItem>
            <SelectItem value="Short answer">Short answer</SelectItem>
            <SelectItem value="Matching">Matching</SelectItem>
          </SelectContent>
        </Select>
        <Label className="flex left-0 p-2 mb-1">Description:</Label>
        <Textarea
          type="text"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="create-question-input mb-2"
        ></Textarea>

        {type === "Multiple choice" && (
          <>
            <Label className="flex left-0 p-2 mb-1">Option A:</Label>
            <Input
              type="text"
              name="optionA"
              value={options.optionA}
              onChange={(e) =>
                setOptions({ ...options, optionA: e.target.value })
              }
              required
              className="create-question-input mb-2"
            />
            <Label className="flex left-0 p-2 mb-1">Option B:</Label>
            <Input
              type="text"
              name="optionB"
              value={options.optionB}
              onChange={(e) =>
                setOptions({ ...options, optionB: e.target.value })
              }
              required
              className="create-question-input mb-2"
            />
            <Label className="flex left-0 p-2 mb-1">Option C:</Label>
            <Input
              type="text"
              name="optionC"
              value={options.optionC}
              onChange={(e) =>
                setOptions({ ...options, optionC: e.target.value })
              }
              required
              className="create-question-input mb-2"
            />
            <Label className="flex left-0 p-2 mb-1">Correct Answer:</Label>
            <Input
              type="text"
              name="correctAnswer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
              className="create-question-input mb-2"
            />
          </>
        )}

        {type === "Short answer" && (
          <>
            <Label className="flex left-0 p-2 mb-1">Correct Answer:</Label>
            <Input
              type="text"
              name="correctAnswer"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              required
              className="create-question-input mb-2"
            />
          </>
        )}

        {type === "Matching" && (
          <>
            <Label className="flex left-0 p-2 mb-1">Pair A:</Label>
            <Input
              type="text"
              name="pairA"
              value={pairA}
              onChange={(e) => setPairA(e.target.value)}
              className="create-question-input mb-2"
            />
            <Label className="flex left-0 p-2 mb-1">Pair B:</Label>
            <Input
              type="text"
              name="pairB"
              value={pairB}
              onChange={(e) => setPairB(e.target.value)}
              className="create-question-input mb-2"
            />
            <Button type="button" onClick={addPair} className="mb-4">
              Add Pair
            </Button>
            <div>
              <h4 className="font-semibold mb-2">Current Pairs:</h4>
              {matchingPairs.map((pair, index) => (
                <div key={index} className="flex justify-between items-center">
                  <p>
                    {index + 1}. {pair.pairA} - {pair.pairB}
                  </p>
                  <Button
                    type="button"
                    onClick={() => removePair(index)}
                    className="text-red-500"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </>
        )}

        <Label className="flex left-0 p-2 mb-1">Explanation:</Label>
        <Textarea
          type="text"
          name="explanation"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          className="create-topic-input mb-2"
        ></Textarea>
        <div className="flex justify-between mt-4">
          <Button type="button" onClick={onClose} className="mr-2">
            Close
          </Button>
          <Button type="submit">Create Question</Button>
        </div>
        {message && <p className="text-green-500 mt-4">{message}</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
}
