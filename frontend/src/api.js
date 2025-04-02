import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to include the token in the Authorization header
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("User");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

//quiz routes
export async function getQuizzes() {
  const res = await api.get("/quizzes/all");
  if (res.status !== 200) {
    throw new Error("Error fetching quizzes");
  } else {
    return res.data;
  }
}

export async function getQuizzesByTopic(topicId) {
  const res = await api.get(`/quizzes/topic/${topicId}`);
  if (res.status !== 200) {
    throw new Error("Error fetching quizzes for the topic");
  } else {
    return res.data;
  }
}

export async function getQuiz(id) {
  const res = await api.get(`/quiz/${id}`);
  if (res.status !== 200) {
    throw new Error("Error fetching quiz");
  } else {
    return res.data;
  }
}

export async function createQuiz(quiz) {
  try {
    const res = await api.post(`/quiz/create`, quiz);
    //console.log("API response:", res);

    if (res.status !== 200) {
      // console.error("Unexpected status code:", res.status);
      throw new Error("Error creating quiz");
    }

    return res.data;
  } catch (error) {
    //console.error("Error in createQuiz function:", error);
    throw error;
  }
}

export async function updateQuiz(id, quiz) {
  const res = await api.patch(`/quiz/update/${id}`, quiz);
  if (res.status !== 200) {
    throw new Error("Error updating quiz");
  }
}

export async function deleteQuiz(id) {
  const res = await api.delete(`/quiz/delete/${id}`);
  if (res.status !== 200) {
    throw new Error("Error deleting quiz");
  }
}

export async function submitQuiz(quizId, answers, correctAnswer) {
  try {
    const res = await api.post("/quiz/submit", {
      quizId,
      answers,
      correctAnswer,
    });
    console.log("API response:", res);
    if (res.status !== 200) {
      throw new Error("Error submitting quiz");
    }
    return res.data;
  } catch (error) {
    console.error("Error submitting quiz:", error);
    console.error("Error details:", error.response); // Log the full error object
    throw error;
  }
}

//topic routes
export async function getTopics() {
  const res = await api.get(`/topics/all`);
  if (res.status !== 200) {
    throw new Error("Error fetching topics");
  } else {
    return res.data;
  }
}

export async function getTopic(id) {
  const res = await api.get(`/topic/${id}`);
  if (res.status !== 200) {
    throw new Error("Error fetching topic");
  } else {
    return res.data;
  }
}

export async function createTopic(formData) {
  try {
    const res = await api.post(`/topics/create`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Specify the correct content type
      },
    });
    console.log("API response:", res);

    if (res.status !== 200) {
      throw new Error("Error creating topic");
    }

    return res.data;
  } catch (error) {
    console.error("Error in createTopic function:", error);
    throw error;
  }
}

export async function updateTopic(id, formData) {
  const res = await api.patch(`/topic/update/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data", // Required for handling file uploads
    },
  });

  if (res.status !== 200) {
    throw new Error("Error updating topic");
  }

  return res.data; // Return response data
}

export async function deleteTopic(id) {
  const res = await api.delete(`/topic/delete/${id}`);
  if (res.status !== 200) {
    throw new Error("Error deleting topic");
  }
}

//user routes
export async function getUsers() {
  const res = await api.get(`/users/all`);
  if (res.status !== 200) {
    throw new Error("Error fetching users");
  } else {
    return res.data;
  }
}

export async function getUser(id) {
  // console.log("Fetching user with ID:", id); // Debugging
  const res = await api.get(`/user/${id}`);
  if (res.status !== 200) {
    throw new Error("Error fetching user");
  }
  return res.data;
}

export async function getUserByUsername(username) {
  const res = await api.get(`/user/username/${username}`);
  if (res.status !== 200) {
    throw new Error("Error fetching user");
  } else {
    return res.data;
  }
}

export async function createUser(user) {
  try {
    const res = await api.post(`/user/create`, user);
    return res.data;
  } catch (error) {
    // Return the error response data to handle it in the frontend
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Error creating user");
    }
  }
}

export async function updateUser(id, user) {
  const res = await api.patch(`/user/update/${id}`, user);
  if (res.status !== 200) {
    throw new Error("Error updating user");
  }
}

export async function deleteUser(id) {
  const res = await api.delete(`/user/delete/${id}`);
  if (res.status !== 200) {
    throw new Error("Error deleting user");
  }
}

export async function verifyUSer(user) {
  const res = await api.post(`/user/login`, user);
  if (res.data.success) {
    return res.data.token;
  } else {
    return;
  }
}

export async function verifyEmail(token) {
  try {
    const res = await api.get(`/verify-email?token=${token}`); // Use the `api` instance
    if (res.status !== 200) {
      throw new Error("Error verifying email");
    }
    return res.data; // Return the data directly, consistent with other functions
  } catch (error) {
    // Handle and return error response like the other functions
    if (error.response && error.response.data) {
      return error.response.data;
    } else {
      throw new Error("Something went wrong while verifying email");
    }
  }
}
