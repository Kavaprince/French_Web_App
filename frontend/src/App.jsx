import { useEffect, useState } from "react";
import "./App.css";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { About } from "./pages/About";
import { Landing } from "./pages/Landing";
import { Topics } from "./pages/Topics";
import { Questions } from "./pages/Questions";
import { Readtopic } from "./pages/Readtopic";
import { Readquestion } from "./pages/Readquestion";
import { Dashboard } from "./pages/Dashboard";
import { Profile } from "./pages/Profile";
import { Contact } from "./pages/Contact";
import { Layout } from "./components/Layout";
import { VerifyEmail } from "@/components/VerifyEmail";
import axios from "axios";

//import { Navbar } from "./components/Navbar";

const App = () => {
  useEffect(() => {
    let token = sessionStorage.getItem("User");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/topics" element={<Topics />} />
          <Route path="/questions" element={<Questions />} />
          <Route path="/readtopic/:id" element={<Readtopic />} />
          <Route path="/readquestion/:id" element={<Readquestion />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  );
};
export default App;
