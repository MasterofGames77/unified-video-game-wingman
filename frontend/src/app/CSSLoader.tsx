"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const CSSLoader = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Conditionally import CSS based on the route
    if (pathname === "/splash") {
      import("./styles/splash.css");
      console.log("Loaded splash styles");
    } else if (pathname === "/assistant") {
      import("./styles/assistant.css");
      console.log("Loaded assistant styles");
    }
  }, [pathname]);

  return null; // No HTML output, purely for loading CSS
};

export default CSSLoader;
