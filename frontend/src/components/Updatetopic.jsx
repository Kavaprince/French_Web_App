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
  const [audioFiles, setAudioFiles] = useState(
    topic.audio?.map((file) => file.url) || []
  );
  const [subtitles, setSubtitles] = useState(
    topic.audio?.map((file) => file.subtitle) || []
  );
  const [translations, setTranslations] = useState(
    topic.audio?.map((file) => file.translation) || []
  );
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async (e) => {
    e.preventDefault();

    const updatedTopic = new FormData();
    updatedTopic.append("title", title);
    updatedTopic.append("description", description);
    updatedTopic.append("learning_objectives", learningObjectives);
    updatedTopic.append("examples", examples);
    updatedTopic.append("tips", tips);

    audioFiles.forEach((file, index) => {
      if (typeof file === "string") {
        updatedTopic.append("audioUrl", file);
      } else {
        updatedTopic.append("audio", file);
      }
      updatedTopic.append("subtitle", subtitles[index] || "");
      updatedTopic.append("translation", translations[index] || "");
    });

    try {
      await onSave({ formData: updatedTopic, id: topic._id });
      alert("Topic updated successfully!");
      setMessage("Topic updated successfully!");
      setError("");
    } catch (err) {
      console.error("Error saving topic:", err);
      setError("Error saving topic");
      setMessage("");
    }
  };

  const handleRemoveAudio = (index) => {
    const updatedAudioFiles = [...audioFiles];
    const updatedSubtitles = [...subtitles];
    const updatedTranslations = [...translations];

    updatedAudioFiles.splice(index, 1);
    updatedSubtitles.splice(index, 1);
    updatedTranslations.splice(index, 1);

    setAudioFiles(updatedAudioFiles);
    setSubtitles(updatedSubtitles);
    setTranslations(updatedTranslations);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm z-10">
      <form
        onSubmit={handleSave}
        className="bg-white p-8 rounded-lg shadow-lg w-1/3 my-5 hover:cursor-pointer overflow-y-auto max-h-[90vh]" // Add scrollable height
      >
        <Label>Topic Title:</Label>
        <Input
          type="text"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Label>Learning Objectives:</Label>
        <Textarea
          name="learning_objectives"
          value={learningObjectives}
          onChange={(e) => setLearningObjectives(e.target.value)}
          required
        ></Textarea>
        <Label>Description:</Label>
        <Textarea
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></Textarea>
        <Label>Examples:</Label>
        <Textarea
          name="examples"
          value={examples}
          onChange={(e) => setExamples(e.target.value)}
          required
        ></Textarea>
        <Label>Tips:</Label>
        <Textarea
          name="tips"
          value={tips}
          onChange={(e) => setTips(e.target.value)}
          required
        ></Textarea>

        <Label>Audio Files:</Label>
        {audioFiles.map((file, index) => (
          <div key={index} className="border p-4 rounded bg-gray-50">
            <Label>Existing Audio {index + 1}:</Label>
            <audio
              controls
              className="w-full border border-gray-300 rounded-lg"
              src={typeof file === "string" ? file : URL.createObjectURL(file)}
            >
              Your browser does not support the audio element.
            </audio>
            <Label>Subtitle:</Label>
            <Input
              type="text"
              value={subtitles[index] || ""}
              onChange={(e) => {
                const updatedSubtitles = [...subtitles];
                updatedSubtitles[index] = e.target.value; // Fixed assignment
                setSubtitles(updatedSubtitles); // Updated state
              }}
              className="update-topic-input mt-1"
            />
            <Label>Translation:</Label>
            <Textarea
              value={translations[index] || ""}
              onChange={(e) => {
                const updatedTranslations = [...translations];
                updatedTranslations[index] = e.target.value; // Fixed assignment
                setTranslations(updatedTranslations); // Updated state
              }}
              className="update-topic-input mt-1"
            />
            <Button
              type="button"
              onClick={() => handleRemoveAudio(index)}
              className="mt-2 bg-red-500 text-white"
            >
              Remove Audio
            </Button>
          </div>
        ))}
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
