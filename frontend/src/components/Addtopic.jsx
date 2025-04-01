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
  const [audio, setAudio] = useState(null); // State to handle audio file
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Create FormData to handle file upload and text data
    const formData = new FormData();
    formData.append("title", title);
    formData.append("learning_objectives", learning_objectives);
    formData.append("description", description);
    formData.append("examples", examples);
    formData.append("tips", tips);
    if (audio) {
      formData.append("audio", audio); // Attach audio file if available
    }

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
      setAudio(null); // Reset audio input
    } catch (error) {
      setError("Error creating topic");
      setMessage("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm z-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-1/3 my-5 hover:cursor-pointer"
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
        <Label className="flex left-0 p-2">Audio File:</Label>
        <Input
          type="file"
          accept="audio/*" // Restrict file types to audio
          onChange={(e) => setAudio(e.target.files[0])} // Set selected file
          className="create-topic-input"
        />
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
