import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveProductionStatic(app: Express) {
  // Try multiple possible build output locations
  const possiblePaths = [
    path.resolve(import.meta.dirname, "..", "dist", "public"),
    path.resolve(import.meta.dirname, "..", "dist"),
    path.resolve(import.meta.dirname, "public"),
  ];

  let distPath: string | null = null;
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      const indexPath = path.join(testPath, "index.html");
      if (fs.existsSync(indexPath)) {
        distPath = testPath;
        break;
      }
    }
  }

  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Tried: ${possiblePaths.join(", ")}. Make sure to build the client first.`,
    );
  }

  console.log(`Serving static files from: ${distPath}`);
  
  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath!, "index.html"));
  });
}