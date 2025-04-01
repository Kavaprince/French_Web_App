import { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { UpdateTopic } from "@/components/Updatetopic";
import { Edit, Trash } from "lucide-react";
import { deleteTopic } from "@/api";
import * as jwt_decode from "jwt-decode";
import { SlideView } from "@/components/SlideView";

export function Topicdetails({ topic, onDelete, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isSlideView, setIsSlideView] = useState(false);
  const [user, setUser] = useState({});

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedTopic) => {
    console.log("Original Topic:", topic);
    console.log("Updated Topic:", updatedTopic);
    onSave({ ...topic, ...updatedTopic });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this topic?")) {
      onDelete(id);
      setDeleteMessage("Deleted successfully");
      setTimeout(() => setDeleteMessage(""), 3000); // Clear message after 3 seconds
    }
  };

  const handleToggleSlideView = () => {
    setIsSlideView(!isSlideView);
  };

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

  return (
    <div className="rounded-lg shadow-lg bg-white border border-gray-200 mb-6">
      {/* Slide View for Non-Admin Users */}
      {isSlideView ? (
        <SlideView topic={topic} onClose={handleToggleSlideView} />
      ) : (
        <>
          {isEditing ? (
            <UpdateTopic
              topic={topic}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          ) : (
            <Collapsible className="text-left">
              {/* Adjusted CollapsibleTrigger for both Admin and Non-Admin actions */}
              <CollapsibleTrigger
                className="flex items-center justify-between w-full bg-blue-50 p-4 cursor-pointer hover:bg-blue-100 border-b border-gray-300 text-lg font-semibold"
                onClick={user.role !== "Admin" ? handleToggleSlideView : null}
              >
                <span className="text-gray-800">
                  {topic.title || "Untitled Topic"}
                </span>
              </CollapsibleTrigger>

              {/* Admin-Only Collapsible Content */}
              {user.role === "Admin" && (
                <CollapsibleContent className="p-6 bg-white rounded-b-lg animate-fade-in">
                  {/* Learning Objectives */}
                  <div className="mb-6">
                    <strong className="text-xl text-primary">
                      Learning Objectives:
                    </strong>
                    <ul className="list-disc list-inside mt-2 text-gray-700">
                      {topic.learning_objectives ? (
                        topic.learning_objectives
                          .split("\n")
                          .map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))
                      ) : (
                        <li>No objectives available.</li>
                      )}
                    </ul>
                  </div>

                  {/* Description */}
                  <div className="mb-6">
                    <strong className="text-xl text-primary">
                      Description:
                    </strong>
                    <p className="mt-2 text-gray-700">
                      {topic.description || "No description available."}
                    </p>
                  </div>

                  {/* Examples */}
                  <div className="mb-6">
                    <strong className="text-xl text-primary">Examples:</strong>
                    <div className="bg-gray-100 p-4 rounded-lg mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {topic.examples || "No examples provided."}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="mb-6">
                    <strong className="text-xl text-primary">Tips:</strong>
                    <div className="bg-gray-100 p-4 rounded-lg mt-2 text-gray-700 leading-relaxed whitespace-pre-wrap">
                      {topic.tips || "No tips provided."}
                    </div>
                  </div>

                  {/* Audio */}
                  {topic.audio?.path && (
                    <div className="mb-6">
                      <strong className="text-xl text-primary">Audio:</strong>
                      <div className="mt-2">
                        <audio
                          controls
                          className="w-full mt-2 border border-gray-300 rounded-lg"
                          src={`http://localhost:3000/${topic.audio.path}`}
                        >
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="flex justify-end mt-6">
                    <button
                      onClick={handleEdit}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white rounded-lg px-4 py-2 mr-2 flex items-center"
                    >
                      <Edit className="h-5 w-5 mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(topic._id)}
                      className="bg-red-400 hover:bg-red-500 text-white rounded-lg px-4 py-2 flex items-center"
                    >
                      <Trash className="h-5 w-5 mr-2" />
                      Delete
                    </button>
                  </div>

                  {/* Success Message */}
                  {deleteMessage && (
                    <p className="text-green-500 text-sm mt-4">
                      {deleteMessage}
                    </p>
                  )}
                </CollapsibleContent>
              )}
            </Collapsible>
          )}
        </>
      )}
    </div>
  );
}
