import { useEffect, useState } from "react";
import { getTopics, deleteTopic, updateTopic } from "@/api";
import { Topicdetails } from "@/components/Topicdetails";
import { Button } from "@/components/ui/button";
import { Addtopic } from "@/components/Addtopic";
import { Plus } from "lucide-react";
import * as jwt_decode from "jwt-decode";

export function Topics() {
  const [topics, setTopics] = useState([]);
  const [showAddTopicForm, setShowAddTopicForm] = useState(false);
  const [user, setUser] = useState({});

  const handleToggleForm = () => {
    setShowAddTopicForm(!showAddTopicForm);
  };

  const handleDeleteTopic = async (topicId) => {
    await deleteTopic(topicId);
    setTopics(topics.filter((topic) => topic._id !== topicId));
  };

  const handleSaveTopic = async ({ formData, id }) => {
    console.log("FormData received in handleSaveTopic:", formData);
    console.log("ID received in handleSaveTopic:", id);

    if (!id) {
      console.error("Error: ID is missing in updated topic");
      return;
    }

    try {
      // Pass the ID and FormData to the API
      await updateTopic(id, formData);

      // Update the topics state (backend should already persist the changes)
      setTopics(
        topics.map((topic) =>
          topic._id === id ? { ...topic, formData } : topic
        )
      );
    } catch (error) {
      console.error("Error updating topic:", error);
      alert("Failed to update topic. Please try again.");
    }
  };

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);

        // console.log("Decoded User:", decodedUser); // Log the decoded user data
        setUser(decodedUser); // Set the decoded user data into the state
      }
    }
    loadUserData();
  }, []);

  useEffect(() => {
    async function fetchTopics() {
      const data = await getTopics();
      console.log(data);
      setTopics(data);
    }
    fetchTopics();
  }, []);

  return (
    <div className="p-4">
      <header className="mb-4 text-left ">
        <h1 className="text-2xl font-bold mb-4 animate-fade-in-left">Topics</h1>
        {user.role === "Admin" ? (
          <p className="text-gray-600 mb-4 animate-slide-up">
            Explore and manage the topics available in the system. You can add
            new topics, view details of existing ones, and keep your knowledge
            base up to date.
          </p>
        ) : (
          <p className="text-gray-600 mb-4 animate-slide-up">
            Welcome to the Topics section! Here you can dive into various
            subjects and expand your knowledge. Browse through the available
            topics, view detailed information, and enhance your learning
            experience.
          </p>
        )}
      </header>
      <div className="flex justify-end mb-2">
        {user.role === "Admin" && (
          <Button
            onClick={handleToggleForm}
            className="mb-2 flex items-center animate-fade-in-right"
          >
            <Plus className="h-5 w-5 my-2" />
            Add Topic
          </Button>
        )}
        {showAddTopicForm && <Addtopic onClose={handleToggleForm} />}
      </div>

      <div className="grid grid-cols-1 gap-4 animate-slide-up">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <Topicdetails
              key={topic._id}
              topic={topic}
              onDelete={handleDeleteTopic}
              onSave={handleSaveTopic}
            />
          ))
        ) : (
          <p>No topics available.</p>
        )}
      </div>
    </div>
  );
}
