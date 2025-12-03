// file: frontend/src/main.jsx

/**
 * Main Entry Point - setup React Router
 *
 * Vai trò: khởi động app, config routes
 */

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Home from "./pages/HomePage";
import Results from "./pages/ItineraryResultsPage";
import Chat from "./pages/ChatPage";
import Admin from "./pages/AdminDashboardPage";
import "./styles/main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="results" element={<Results />} />
          <Route path="chat" element={<Chat />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
