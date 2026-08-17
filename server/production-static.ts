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
    try {
      if (fs.existsSync(testPath)) {
        const indexPath = path.join(testPath, "index.html");
        if (fs.existsSync(indexPath)) {
          distPath = testPath;
          break;
        }
      }
    } catch (error) {
      console.warn(`Error checking path ${testPath}:`, error);
      continue;
    }
  }

  if (!distPath) {
    console.warn(
      `Could not find the build directory. Tried: ${possiblePaths.join(", ")}. Creating fallback static handling.`,
    );
    
    // Fallback: serve a simple index.html for health checks
    app.get('*', (req, res) => {
      if (req.path === '/' || req.path === '/health') {
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>App Starting</title></head>
            <body><h1>Application is starting...</h1></body>
          </html>
        `);
      } else {
        res.status(404).json({ error: 'Not found' });
      }
    });
    return;
  }

  console.log(`Serving static files from: ${distPath}`);
  
  // Enhanced static file serving with error handling
  app.use(express.static(distPath, {
    maxAge: '1h',
    setHeaders: (res, path) => {
      if (path.endsWith('.html')) {
        res.setHeader('Cache-Control', 'public, max-age=0');
      }
    }
  }));

  // Enhanced fallback to index.html with error handling
  app.use("*", (req, res) => {
    try {
      const indexPath = path.resolve(distPath!, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'Application not found' });
      }
    } catch (error) {
      console.error('Error serving index.html:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
}