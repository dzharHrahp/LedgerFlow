import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [displayChildren, setDisplayChildren] = useState(children);
  const [stage, setStage] = useState<"fadeIn" | "fadeOut">("fadeIn");

  useEffect(() => {
    if (location.pathname !== window.location.pathname) {
      setStage("fadeOut");
    }
  }, [location]);

  useEffect(() => {
    if (stage === "fadeOut") {
      const timeout = setTimeout(() => {
        setDisplayChildren(children);
        setStage("fadeIn");
      }, 200); // durasi transisi
      return () => clearTimeout(timeout);
    }
  }, [stage, children]);

  return (
    <div
      className={`transition-all duration-200 ${
        stage === "fadeIn"
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4"
      }`}
    >
      {displayChildren}
    </div>
  );
}
    