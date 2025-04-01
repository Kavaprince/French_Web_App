import express from "express";
import cors from "cors";
import quizRoutes from "./routes/quizRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";

const PORT = process.env.PORT || 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(quizRoutes);
app.use(topicRoutes);
app.use(userRoutes);
app.use(submissionRoutes);
app.use("/uploads", express.static("uploads"));

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
