import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { UpdateQuestion } from "@/components/Updatequestion";
import { AnswerQuestion } from "@/components/Answerquestion";
import { Edit, Trash } from "lucide-react";
import { deleteQuiz, getQuizzes, updateQuiz } from "@/api";
import * as jwt_decode from "jwt-decode";

export function Questiondetails({ quiz, onDelete, onSave, onSubmitAnswer }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAnswering, setIsAnswering] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [user, setUser] = useState({});

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedQuiz) => {
    onSave(updatedQuiz);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsAnswering(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      onDelete(id);
      setDeleteMessage("Deleted successfully");
      setTimeout(() => setDeleteMessage(""), 3000); // Clear message after 3 seconds
    }
  };

  const handleAnswer = () => {
    setIsAnswering(true);
  };

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);
        setUser(decodedUser); // Set the decoded user data into the state
      }
    }
    loadUserData();
  }, []);

  return (
    <div className="">
      {isEditing ? (
        <UpdateQuestion
          quiz={quiz}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : isAnswering ? (
        <AnswerQuestion
          quiz={quiz}
          onSubmitAnswer={onSubmitAnswer}
          onCancel={handleCancel}
        />
      ) : (
        <Collapsible
          key={quiz._id}
          quiz={quiz}
          className="mb-4 animate-slide-up"
        >
          <CollapsibleTrigger className="flex text-lg font-semibold hover:cursor-pointer hover:bg-gray-200 p-4 border-b border-gray-300 w-full">
            {quiz.title}
          </CollapsibleTrigger>
          <CollapsibleContent className="bg-gray-50 p-4 rounded-b-lg w-full animate-slide-up">
            <div className="flex flex-col p-4 bg-white shadow-md rounded-lg w-full">
              <div className="mb-5 text-left">
                <strong>Type:</strong>
                <div>{quiz.type}</div>
              </div>
              <div className="mb-5 text-left">
                <strong>Description:</strong>
                <div>{quiz.description}</div>
              </div>
              {quiz.type === "Multiple choice" && (
                <div className="mb-5 text-left">
                  <strong>Options:</strong>
                  <ul className="list-disc list-inside">
                    {quiz.options.map((option, index) => (
                      <li key={index}>{option}</li>
                    ))}
                  </ul>
                </div>
              )}
              {user.role === "Admin" && (
                <>
                  <div className="mb-5 bg-gray-100 p-3 rounded-md w-full overflow-auto text-left">
                    <strong className="block mb-2">Correct Answer:</strong>
                    <div className="font-mono">
                      {quiz.type === "Matching" &&
                        quiz.correctAnswer.map((pair, index) => (
                          <p key={index}>
                            Pair {index + 1}: {pair.pairA} ↔ {pair.pairB}
                          </p>
                        ))}
                      {quiz.type !== "Matching" && (
                        <div>{quiz.correctAnswer}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-5 text-left">
                    <strong>Explanation:</strong>
                    <div className="bg-gray-100 p-3 rounded-md border border-gray-300 whitespace-pre-line leading-relaxed font-mono">
                      {quiz.explanation}
                    </div>
                  </div>
                </>
              )}

              {user.role === "Admin" ? (
                <div className="flex justify-end">
                  <div className="mr-2">
                    <Button
                      onClick={handleEdit}
                      className="flex items-center justify-center"
                    >
                      <Edit />
                    </Button>
                  </div>
                  <div>
                    <Button
                      onClick={() => handleDelete(quiz._id)}
                      className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      <Trash />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button onClick={handleAnswer} className="flex items-center">
                    Answer
                  </Button>
                </div>
              )}
              {deleteMessage && (
                <div className="mt-4 text-green-500">{deleteMessage}</div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
