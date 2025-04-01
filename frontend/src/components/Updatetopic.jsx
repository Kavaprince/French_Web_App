import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateTopic } from "@/api";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function UpdateTopic({ topic, onSave, onCancel }) {
  const [title, setTitle] = useState(topic.title || "");
  const [description, setDescription] = useState(topic.description || "");
  const [learningObjectives, setLearningObjectives] = useState(
    topic.learning_objectives || ""
  );
  const [examples, setExamples] = useState(topic.examples || "");
  const [tips, setTips] = useState(topic.tips || "");
  const [audio, setAudio] = useState(null); // For new audio file
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();

    // Create FormData to handle text data and files
    const updatedTopic = new FormData();
    updatedTopic.append("title", title);
    updatedTopic.append("description", description);
    updatedTopic.append("learning_objectives", learningObjectives);
    updatedTopic.append("examples", examples);
    updatedTopic.append("tips", tips);

    // Attach the audio file if it's provided
    if (audio) {
      updatedTopic.append("audio", audio);
    }

    try {
      // Explicitly pass the topic ID along with the FormData
      await onSave({ formData: updatedTopic, id: topic._id });
      setMessage("Topic updated successfully!");
      setError("");
      alert("Topic updated successfully!");
      console.log("Updated topic being saved:", updatedTopic);
    } catch (err) {
      setError("Error saving topic");
      setMessage("");
      console.error("Error saving topic:", err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm z-10">
      <form
        onSubmit={handleSave}
        className="bg-white p-8 rounded-lg shadow-lg w-1/3 my-5 hover:cursor-pointer"
      >
        <Label className="flex left-0 p-2">Topic Title:</Label>
        <Input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="update-topic-input"
        />
        <Label className="flex left-0 p-2">Learning Objectives:</Label>
        <Textarea
          name="learning_objectives"
          value={learningObjectives}
          onChange={(e) => setLearningObjectives(e.target.value)}
          required
          className="update-topic-input"
        ></Textarea>
        <Label className="flex left-0 p-2">Description:</Label>
        <Textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          className="update-topic-input"
        ></Textarea>
        <Label className="flex left-0 p-2">Examples:</Label>
        <Textarea
          name="examples"
          value={examples}
          onChange={(e) => setExamples(e.target.value)}
          required
          className="update-topic-input"
        ></Textarea>
        <Label className="flex left-0 p-2">Tips:</Label>
        <Textarea
          name="tips"
          value={tips}
          onChange={(e) => setTips(e.target.value)}
          required
          className="update-topic-input"
        ></Textarea>
        <Label className="flex left-0 p-2">Audio File:</Label>
        <Input
          type="file"
          accept="audio/*" // Restrict input to audio files
          onChange={(e) => setAudio(e.target.files[0])} // Update state with selected file
          className="update-topic-input"
        />
        <div className="flex justify-between mt-4">
          <Button type="button" onClick={onCancel} className="mr-2">
            Cancel
          </Button>
          <Button type="submit">Update Topic</Button>
        </div>
        {message && <p className="text-green-500 mt-4">{message}</p>}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </form>
    </div>
  );
}
