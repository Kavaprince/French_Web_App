import { getQuizzes, getUser } from "@/api";
import { getTopics } from "@/api";
import { useEffect, useState } from "react";
import { Maintable } from "@/components/Maintable";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as jwt_decode from "jwt-decode";

export function Dashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [user, setUser] = useState({});
  const [score, setScore] = useState(0); // Track the user's score

  // Load user data from the JWT token
  useEffect(() => {
    async function loadUserData() {
      const token = sessionStorage.getItem("User");
      if (token) {
        const decodedUser = jwt_decode.jwtDecode(token);

        // console.log("Decoded User:", decodedUser); // Log the decoded user data
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

  useEffect(() => {
    async function fetchQuizzes() {
      const data = await getQuizzes();
      console.log(data);
      setQuizzes(data);
    }
    fetchQuizzes();
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
      <header className="mb-4 text-left">
        <h1 className="text-2xl font-bold mb-4 animate-fade-in-left">
          Dashboard
        </h1>
        <h2 className="text-xl font-semibold animate-fade-in-left">
          Welcome, {user.username}!
        </h2>
      </header>

      {/* Admin View */}
      {user.role === "Admin" ? (
        <div className="mb-4">
          <p className="text-gray-600 mb-4 text-left animate-slide-up">
            This is your Dashboard, here you can manage your quizzes and topics
            efficiently. Use the side bar on the left to view, edit, and delete
            your quizzes. You can also add new topics to keep your content
            organized and up-to-date. Stay productive and make the most out of
            your dashboard. Scroll on the sidebar to edit, delete, and manage
            the questions and topics.
          </p>
        </div>
      ) : (
        /* User View */
        <div className="mb-4">
          <p className="text-gray-600 mb-4 text-left animate-slide-up">
            Welcome to your Dashboard! Here you can take quizzes, track your
            progress, and explore new topics. Use the side bar on the left to
            find quizzes tailored to your interests. You can also view and
            update your profile information. Stay engaged and make the most out
            of your dashboard. Let's keep learning and growing!
          </p>

          {/* Modern Score Display */}
          <div className="bg-white shadow-md rounded-lg p-4 text-center animate-slide-up">
            <h3 className="text-lg font-semibold text-gray-700">
              Your Current Score
            </h3>
            <p className="text-4xl font-bold text-blue-600">{score}</p>
            <p className="text-sm text-gray-500 mt-1">
              Keep going to improve your score!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
