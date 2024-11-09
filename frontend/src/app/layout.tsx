// layout.tsx
import React from "react";
import CSSLoader from "./CSSLoader"; // Import CSSLoader
import { AuthProvider } from "../context/authContext"; // Adjust the path if necessary

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
          <CSSLoader /> {/* Load CSS conditionally based on the route */}
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
