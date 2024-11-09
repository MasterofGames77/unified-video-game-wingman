"use client"; // Enables client-side rendering

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const CSSLoader = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Determine which CSS file to load based on the current route
    if (pathname === "/splash") {
      import("../app/styles/globals-splash.css");
    } else if (pathname === "/assistant") {
      import("../app/styles/globals-assistant.css");
    }
  }, [pathname]);

  return null; // This component only loads CSS and doesn't render any HTML
};

export default CSSLoader;
