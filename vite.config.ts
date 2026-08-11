import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Dev-only mock backend so the "What's My Vibe" flow works end-to-end without
// the (not-yet-open-sourced) production API server.
function mockApi(): Plugin {
  const COLORS = ["Violet", "Blue", "Green", "Gold", "Pink", "Indigo"] as const;
  const MEANINGS: Record<string, { positive: string[]; negative: string[]; remedy: string }> = {
    Violet: {
      positive: ["Deeply intuitive", "Spiritually aware", "Creative visionary"],
      negative: ["Prone to overthinking", "Can feel detached from routine"],
      remedy: "Ground yourself with a short morning walk and journal one intention for the day.",
    },
    Blue: {
      positive: ["Calm communicator", "Trustworthy", "Emotionally steady"],
      negative: ["Sometimes holds feelings in", "Can over-give to others"],
      remedy: "Practice 5 minutes of throat-chakra breathing and speak one honest need aloud.",
    },
    Green: {
      positive: ["Naturally healing", "Balanced", "Compassionate"],
      negative: ["May neglect own needs", "Avoids conflict"],
      remedy: "Place a hand on your heart, take 7 slow breaths, and name something you're grateful for.",
    },
    Gold: {
      positive: ["Confident", "Abundant energy", "Inspires others"],
      negative: ["Can burn out", "Impatient with slow progress"],
      remedy: "Schedule one genuine rest block today and let it be unproductive.",
    },
    Pink: {
      positive: ["Loving", "Gentle", "Emotionally generous"],
      negative: ["Over-sensitive to criticism", "Puts others first"],
      remedy: "Write yourself the kind message you'd give a close friend.",
    },
    Indigo: {
      positive: ["Insightful", "Focused", "Perceptive"],
      negative: ["Can isolate", "Holds high self-standards"],
      remedy: "Share one idea with someone today instead of keeping it to yourself.",
    },
  };

  return {
    name: "auraeye-mock-api",
    configureServer(server) {
      server.middlewares.use("/api/quick-vibe", (req, res) => {
        // Consume the multipart body but ignore its contents; the mock derives a
        // deterministic-but-varied result so the demo feels real.
        req.on("data", () => {});
        req.on("end", () => {
          const dominantColor = COLORS[Math.floor(Math.random() * COLORS.length)];
          const meaning = MEANINGS[dominantColor];
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              dominantColor,
              colorMeaning: meaning,
              energyLevel: 60 + Math.floor(Math.random() * 40),
              message: `Your field is radiating ${dominantColor.toLowerCase()} energy today.`,
              readingId: Math.floor(Math.random() * 100000),
              visualizedImage: null,
            }),
          );
        });
      });

      // Generic OK for the other endpoints vibe.tsx may call (healer history, etc.).
      server.middlewares.use("/api/healer-vibe-reading", (req, res) => {
        req.on("data", () => {});
        req.on("end", () => {
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true }));
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), mockApi()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client/src"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
});
