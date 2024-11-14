import React from "react";
import CSSLoader from "./CSSLoader";
import { AuthProvider } from "../context/authContext";

export const metadata = {
  title: "Video Game Wingman",
  description: "Empowering gamers with insights and analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CSSLoader /> {/* Dynamically load CSS based on route */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
