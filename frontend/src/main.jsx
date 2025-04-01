import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
//import Record from "./components/ModifyRecord";
//import RecordList from "./components/RecordList";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App /> {/* Render the App component */}
  </React.StrictMode>
);
