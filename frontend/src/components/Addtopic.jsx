import { useState } from "react";
import { createTopic } from "@/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function Addtopic({ onClose }) {
  const [title, setTitle] = useState("");
  const [learning_objectives, setLearning_objectives] = useState("");
  const [description, setDescription] = useState("");
  const [examples, setExamples] = useState("");
  const [tips, setTips] = useState("");
  const [audioInputs, setAudioInputs] = useState([
    { audio: null, subtitle: "", translation: "" },
  ]); // Array for dynamic audio inputs
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (index, field, value) => {
    const updatedInputs = [...audioInputs];
    updatedInputs[index][field] = value;
    setAudioInputs(updatedInputs);
  };

  const handleAddInput = () => {
    setAudioInputs([
      ...audioInputs,
      { audio: null, subtitle: "", translation: "" },
    ]); // Add a new input set
  };

  const handleRemoveInput = (index) => {
    const updatedInputs = audioInputs.filter((_, i) => i !== index); // Remove selected input
    setAudioInputs(updatedInputs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData to handle multiple files and associated data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("learning_objectives", learning_objectives);
    formData.append("description", description);
    formData.append("examples", examples);
    formData.append("tips", tips);

    // Append all dynamic audio inputs
    audioInputs.forEach((input, index) => {
      if (input.audio) {
        formData.append(`audio`, input.audio); // Add audio file
        formData.append(`subtitle`, input.subtitle || ""); // Add corresponding subtitle
        formData.append(`translation`, input.translation || ""); // Add corresponding translation
      }
    });

    try {
      const response = await createTopic(formData); // Pass FormData to API
      console.log("Server response:", response);
      setMessage("Topic created successfully!");
      setError("");
      setTitle("");
      setLearning_objectives("");
      setDescription("");
      setExamples("");
      setTips("");
      setAudioInputs([{ audio: null, subtitle: "", translation: "" }]); // Reset all inputs
    } catch (error) {
      setError("Error creating topic");
      setMessage("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm z-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-1/3 my-5 hover:cursor-pointer overflow-y-auto max-h-[90vh]" // Add scrollable height
      >
        <Label className="flex left-0 p-2">Topic Title:</Label>
        <Input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="create-topic-input"
        />
        <Label className="flex left-0 p-2">Learning Objectives:</Label>
        <Textarea
          name="learning_objectives"
          value={learning_objectives}
          onChange={(e) => setLearning_objectives(e.target.value)}
          required
          className="create-topic-input"
        ></Textarea>
        <Label className="flex left-0 p-2">Description:</Label>
        <Textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="create-topic-input"
        ></Textarea>
        <Label className="flex left-0 p-2">Examples:</Label>
        <Textarea
          name="examples"
          value={examples}
          onChange={(e) => setExamples(e.target.value)}
          required
          className="create-topic-input"
        ></Textarea>
        <Label className="flex left-0 p-2">Tips:</Label>
        <Textarea
          name="tips"
          value={tips}
          onChange={(e) => setTips(e.target.value)}
          required
          className="create-topic-input"
        ></Textarea>
        <Label className="flex left-0 p-2">Audio Inputs:</Label>
        {audioInputs.map((input, index) => (
          <div key={index} className="mt-2 border p-4 rounded bg-gray-50">
            <Label>Audio File:</Label>
            <Input
              type="file"
              accept="audio/*"
              onChange={(e) =>
                handleInputChange(index, "audio", e.target.files[0])
              }
              className="create-topic-input mt-1"
            />
            <Label>Subtitle:</Label>
            <Input
              type="text"
              value={input.subtitle}
              onChange={(e) =>
                handleInputChange(index, "subtitle", e.target.value)
              }
              className="create-topic-input mt-1"
            />
            <Label>Translation:</Label>
            <Textarea
              value={input.translation}
              onChange={(e) =>
                handleInputChange(index, "translation", e.target.value)
              }
              className="create-topic-input mt-1"
            />
            {audioInputs.length > 1 && (
              <Button
                type="button"
                onClick={() => handleRemoveInput(index)}
                className="mt-2 bg-red-500 text-white"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          onClick={handleAddInput}
          className="mt-4 bg-blue-500 text-white"
        >
          Add Another Audio
        </Button>
        <div className="flex justify-between mt-4">
          <Button type="button" onClick={onClose} className="mr-2">
            Close
          </Button>
          <Button type="submit">Create Topic</Button>
        </div>
        {message && <p className="text-green-500 mt-4">{message}</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
}
