"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Sidebar from "../../components/Sidebar";
import Image from "next/image";
import { Conversation } from "../../../types";
import { v4 as uuidv4 } from "uuid";
import "../styles/assistant.css";

export default function AssistantPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    let storedUserId = localStorage.getItem("userId");
    if (!storedUserId || storedUserId === "null") {
      storedUserId = uuidv4();
      localStorage.setItem("userId", storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  const fetchConversations = useCallback(async () => {
    if (!userId) return;

    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/assistant/getConversation?userId=${userId}`
      );
      setConversations(res.data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [userId, fetchConversations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_BASE_URL}/api/assistant`, {
        userId,
        question,
      });
      setResponse(res.data.answer);
      fetchConversations(); // Refresh conversation list after submitting a new question
    } catch (error) {
      console.error("Error submitting form:", error);
      setError("There was an error processing your request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuestion("");
    setResponse("");
    setError("");
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setQuestion(conversation.question);
    setResponse(conversation.response);
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/deleteInteraction`, { id });
      setConversations(conversations.filter((convo) => convo._id !== id));
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  return (
    <div className="assistant-container">
      {userId && (
        <Sidebar
          userId={userId}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
        />
      )}
      <div className="main-content">
        <Image
          src="/video-game-wingman-logo.png"
          alt="Video Game Wingman Logo"
          width={300}
          height={300}
          className="logo"
          style={{ width: "auto", height: "auto" }} // Maintain aspect ratio
          priority
        />

        <form onSubmit={handleSubmit} className="question-form">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Message Video Game Wingman..."
            required
            className="question-input"
          />
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? "Loading..." : "Submit"}
          </button>
          <button type="button" onClick={handleClear} className="clear-button">
            Clear
          </button>
        </form>

        {response && (
          <div className="response-container">
            <h2>Response</h2>
            <p>{response}</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}
