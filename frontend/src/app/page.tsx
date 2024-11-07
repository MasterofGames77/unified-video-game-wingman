"use client";

import React, { useState } from "react";
import axios from "axios";
import Image from "next/image";
import "./globals.css";

interface SignUpResponse {
  message: string;
  link?: string; // Optional link if the user is approved
  position?: number; // Optional user's waitlist position
}

const SplashPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Ensure no page reload
    setLoading(true);

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.post<SignUpResponse>(
        `${API_BASE_URL}/api/auth/signup`,
        { email }
      );

      // Show confirmation message or error if email was successfully added
      setMessage(response.data.message);

      // If the user is approved, set the link to access the assistant
      if (response.data.link) {
        setLink(response.data.link);
      }

      // Set the user's waitlist position if provided
      if (response.data.position !== undefined) {
        setPosition(response.data.position);
      }
    } catch (error) {
      console.error("Error adding email to waitlist:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <Image
        src="/video-game-wingman-logo.png"
        alt="Video Game Wingman Logo"
        width={300}
        height={300}
        priority // Adding priority for LCP optimization
        style={{ maxWidth: "100%", height: "auto", marginTop: "30px" }}
      />
      <h1>Taking Video Games To Their Greatest Heights!</h1>
      <form onSubmit={handleSignUp} className="auth-form">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? <div className="loading-spinner"></div> : "Submit"}
        </button>
      </form>
      <ul className="bullet-points">
        <li>
          Incredible Video Game Guides (Simply upload an image of where you need
          help)
        </li>
        <li>Amazing Video Game Recommendations</li>
        <li>Discover Hidden Secrets</li>
        <li>Outstanding Video Game Tips and Tricks</li>
      </ul>
      <p className="quote">
        First 5,000 Users to sign up before December 31st get access to Wingman
        Pro 1 year for free!
      </p>
      <div className="pro-features-section">
        <h4>Wingman Pro Features:</h4>
        <ul className="bullet-points-2">
          <li>Advanced Game Guides</li>
          <li>Real-Time Notifications</li>
          <li>Access to Exclusive Discord Bot</li>
        </ul>
      </div>
      {message && <p>{message}</p>}
      {link && (
        <p>
          You have been approved! Access the AI assistant{" "}
          <a href={link} target="_blank" rel="noopener noreferrer">
            here
          </a>
          .
        </p>
      )}
      {position !== null && <p>Your waitlist position: {position}</p>}
    </div>
  );
};

export default SplashPage;
