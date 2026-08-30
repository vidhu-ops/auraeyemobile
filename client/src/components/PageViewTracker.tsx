import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

const SESSION_KEY = "ae_page_session";

function getSessionId(): string {
  try {
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
      id = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `anon-${Date.now()}`;
  }
}

/** Records page views for admin website analytics (fire-and-forget). */
export default function PageViewTracker() {
  const [location] = useLocation();
  const { user } = useAuth();
  const lastPath = useRef("");

  useEffect(() => {
    if (!location || location === lastPath.current) return;
    lastPath.current = location;

    const payload = {
      path: location,
      referrer: document.referrer || null,
      sessionId: getSessionId(),
    };

    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    }).catch(() => {
      // Non-critical analytics
    });
  }, [location, user?.id]);

  return null;
}
