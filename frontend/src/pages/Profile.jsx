import { useEffect, useState } from "react";
import * as jwt_decode from "jwt-decode";
import { Label } from "@/components/ui/label";
import { Edit, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser } from "@/api";

export function Profile() {
  const [user, setUser] = useState({});
  const [score, setScore] = useState(0); // Track the user's score
  const [isEditing, setIsEditing] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");

  const handleEdit = () => {
    setIsEditing(true);
    alert("Edit functionality is not implemented yet!"); // Placeholder for edit logic
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete your account?")) {
      // Simulate delete account
      setDeleteMessage("Account deleted successfully.");
      setTimeout(() => setDeleteMessage(""), 3000); // Clear message after 3 seconds
      // Add logic here to call the API and delete user
    }
  };

  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);
        console.log("Decoded User:", decodedUser); // Log the decoded user data
        setUser(decodedUser); // Set the decoded user data into the state

        // Optionally fetch user details if score isn't in the token
        if (!decodedUser.score) {
          fetchUserDetails(decodedUser._id); // Replace `_id` with the correct field
        } else {
          setScore(decodedUser.score); // Set score if available in the token
        }
      }
    }

    // Fetch user details from the server
    async function fetchUserDetails(userId) {
      try {
        const userDetails = await getUser(userId);
        //console.log("User Details:", userDetails);
        setScore(userDetails.score); // Update the user's score
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    }

    loadUserData();
  }, []);

  return (
    <div className="p-4">
      <header className="mb-4 text-left">
        <h1 className="text-2xl font-bold mb-4 text-gray-800 animate-fade-in-left">
          Profile
        </h1>
        {user.role === "Admin" ? (
          <p className="text-gray-600 mb-4 animate-slide-up">
            As an admin, you have tools to effectively manage the system. Add
            and update topics, review details, and ensure everything runs
            smoothly. Your role is key to maintaining an organized and efficient
            platform for all users.
          </p>
        ) : (
          <p className="text-gray-600 mb-4 animate-slide-up">
            Welcome to your profile! Here, you can explore topics that match
            your interests, track your learning progress, and dive deeper into
            the resources available.
          </p>
        )}
      </header>
      <div className="space-y-4">
        <div className="flex justify-end animate-fade-in-right">
          <div className="mr-1">
            <Button
              onClick={handleEdit}
              className="text-primary bg-white hover:bg-gray-300"
            >
              <Edit />
            </Button>
          </div>
          <div className="ml-1">
            <Button
              onClick={handleDelete}
              className="text-primary bg-white hover:bg-gray-300"
            >
              <Trash />
            </Button>
          </div>
        </div>
        <div className="flex animate-slide-up">
          <div className="rounded-xl p-8 w-full max-w-md mx-auto space-y-6 shadow-md ">
            <h1 className="text-2xl font-bold text-gray-900 text-center">
              User Information
            </h1>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                <span className="text-gray-600 font-medium">Username:</span>
                <span className="text-lg font-semibold text-gray-800">
                  {user.username || "Not available"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                <span className="text-gray-600 font-medium">Email:</span>
                <span className="text-lg font-semibold text-gray-800">
                  {user.email || "Not available"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Role:</span>
                <span className="text-lg font-semibold text-gray-800">
                  {user.role || "Not available"}
                </span>
              </div>
            </div>
          </div>
          {user.role !== "Admin" && (
            <div className="rounded-xl p-8 w-full max-w-md mx-auto space-y-6 shadow-md">
              <h1 className="text-2xl font-bold text-gray-900 text-center">
                User Total Score:
              </h1>
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-blue-600">
                    {score}
                  </span>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Keep aiming high and improving!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
