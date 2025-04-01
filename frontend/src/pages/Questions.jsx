import { Addquestion } from "@/components/Addquestion";
import { useEffect, useState } from "react";
import { getTopics, getQuizzesByTopic, deleteQuiz, updateQuiz } from "@/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Questiondetails } from "@/components/Questiondetails";
import { useSearchParams } from "react-router-dom";
import * as jwt_decode from "jwt-decode";

export function Questions() {
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState({});

  useEffect(() => {
    async function fetchTopics() {
      const data = await getTopics();
      setTopics(data);
      const topicId = searchParams.get("topicId");
      if (topicId) {
        const topic = data.find((topic) => topic._id === topicId);
        if (topic) {
          setSelectedTopic(topic);
          const quizzesData = await getQuizzesByTopic(topicId);
          setQuizzes(quizzesData);
        }
      }
    }
    fetchTopics();
  }, [searchParams]);

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);
        setUser(decodedUser);
      }
    }
    loadUserData();
  }, []);

  const handleSelectTopic = async (value) => {
    const topic = topics.find((topic) => topic._id === value);
    setSelectedTopic(topic);
    setShowAddQuestionForm(false);
    const quizzesData = await getQuizzesByTopic(value);
    setQuizzes(quizzesData);
  };

  const handleToggleAddQuestionForm = () => {
    if (selectedTopic) {
      setShowAddQuestionForm(!showAddQuestionForm);
    } else {
      alert("Please select a topic before adding a question.");
    }
  };

  const handleDeleteQuestion = async (quizId) => {
    await deleteQuiz(quizId);
    const updatedQuizzes = quizzes.filter((quiz) => quiz._id !== quizId);
    setQuizzes(updatedQuizzes);
  };

  const handleSaveQuestion = async (updatedQuiz) => {
    try {
      await updateQuiz(updatedQuiz._id, updatedQuiz);
      setQuizzes(
        quizzes.map((quiz) =>
          quiz._id === updatedQuiz._id ? updatedQuiz : quiz
        )
      );
    } catch (error) {
      console.error("Error updating quiz:", error);
      alert("Failed to update quiz. Please try again.");
    }
  };

  return (
    <div className="p-4">
      <header className="mb-4 text-left">
        <h1 className="text-2xl font-bold mb-4 animate-fade-in-left">
          Questions
        </h1>
        {user.role === "Admin" ? (
          <p className="text-gray-600 mb-4 animate-slide-up">
            This page is dedicated to managing questions for each topic within
            the system. Here, you can add new questions, review and edit
            existing ones, and ensure that all topics are thoroughly covered
            with relevant and up-to-date information. Utilize this section to
            maintain the quality and comprehensiveness of your knowledge base by
            keeping the questions well-organized and current.
          </p>
        ) : (
          <p className="text-gray-600 mb-4 animate-slide-up">
            Welcome to the Questions section! Here, you can explore and answer
            questions related to various topics. Dive deep into each topic and
            test your knowledge with the available questions. This section is
            designed to help you enhance your learning experience and solidify
            your understanding of the subject matter.
          </p>
        )}
      </header>
      <div className="flex flex-col mb-2 text-left animate">
        <div className="flex animate-slide-up">
          <Select
            onValueChange={handleSelectTopic}
            value={selectedTopic ? selectedTopic._id : ""}
          >
            <SelectTrigger className="mb-4 p-2 border rounded bg-white text-black">
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent className="bg-white text-black">
              {topics.map((topic) => (
                <SelectItem key={topic._id} value={topic._id}>
                  {topic.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="text-right">
        {user.role === "Admin" && (
          <Button
            onClick={handleToggleAddQuestionForm}
            className="mb-4 animate-fade-in-right"
          >
            <Plus className="h-5 w-5 my-2" />
            Add Question
          </Button>
        )}
      </div>

      {showAddQuestionForm && selectedTopic && (
        <Addquestion
          onClose={handleToggleAddQuestionForm}
          selectedTopic={selectedTopic}
        />
      )}
      <div className="animate-fade-in-sequence">
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <Questiondetails
              key={quiz._id}
              quiz={quiz}
              onDelete={handleDeleteQuestion}
              onSave={handleSaveQuestion}
            />
          ))
        ) : (
          <p>No questions available for this topic.</p>
        )}
      </div>
    </div>
  );
}
