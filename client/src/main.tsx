import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "next-themes";
import { registerServiceWorker } from "./utils/register-sw";

// Handle hard refresh on link open
const lastVisit = localStorage.getItem('last_visit_timestamp');
const now = Date.now();
// If it's been more than 5 minutes since last visit, or first visit
if (!lastVisit || (now - parseInt(lastVisit)) > 300000) {
  localStorage.setItem('last_visit_timestamp', now.toString());
  if (!window.location.search.includes('v=')) {
    const url = new URL(window.location.href);
    url.searchParams.set('v', now.toString());
    window.location.replace(url.toString());
  }
} else {
  localStorage.setItem('last_visit_timestamp', now.toString());
}

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light">
    <App />
  </ThemeProvider>
);
