import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { serveProductionStatic } from "./production-static";
import { initializeWhatsApp } from "./whatsapp-service";

const app = express();

// Add health check endpoint first (before other middleware)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint for health checks
app.get('/', (req, res, next) => {
  // If this is a health check request, respond quickly
  if (req.get('User-Agent')?.includes('health') || req.get('User-Agent')?.includes('check')) {
    return res.status(200).json({ status: 'ok' });
  }
  // Otherwise, continue to normal routing
  next();
});

// Configure body parsers with increased limits for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize WhatsApp service
  console.log('Initializing WhatsApp service...');
  initializeWhatsApp();
  
  const server = await registerRoutes(app);

  // Enhanced error handling for static file serving
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    // Log error but don't crash the server
    console.error(`Error ${status} on ${req.method} ${req.path}:`, message);
    
    if (!res.headersSent) {
      res.status(status).json({ message });
    }
    
    // Don't throw error - this prevents server crashes
    if (status >= 500) {
      console.error('Server error stack:', err.stack);
    }
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    try {
      serveProductionStatic(app);
    } catch (error) {
      console.error("Failed to serve static files with flexible approach:", error);
      // Enhanced fallback with basic static serving
      try {
        serveStatic(app);
      } catch (fallbackError) {
        console.error("All static serving methods failed:", fallbackError);
        // Ultimate fallback for health checks
        app.get('*', (req, res) => {
          if (req.path === '/' || req.path === '/health') {
            res.status(200).send('<html><body><h1>Server Running</h1></body></html>');
          } else {
            res.status(404).send('Not Found');
          }
        });
      }
    }
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = process.env.PORT || 5000;
  const host = process.env.HOST || "0.0.0.0";
  
  server.listen({
    port: Number(port),
    host,
    reusePort: true,
  }, async () => {
    log(`serving on host ${host} port ${port}`);
    
    // Start daily horoscope cron job after server starts
    try {
      const { startDailyHoroscopeCron } = await import('./horoscope-scraper');
      startDailyHoroscopeCron();
    } catch (error: any) {
      console.error('Failed to start horoscope cron job:', error?.message || error);
    }
    
    // Start notification scheduler
    try {
      const { startNotificationScheduler } = await import('./notification-scheduler');
      startNotificationScheduler();
    } catch (error: any) {
      console.error('Failed to start notification scheduler:', error?.message || error);
    }
  });

  // Add timeout handling for server startup
  server.setTimeout(30000); // 30 second timeout

  // Handle server errors gracefully
  server.on('error', (error: any) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${port} is already in use`);
    }
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
})();
