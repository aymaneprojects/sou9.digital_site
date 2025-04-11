import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import session from "express-session";
import createMemoryStore from "memorystore";
import { closeDb } from "./db";
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

// Create memory store for sessions
const MemoryStore = createMemoryStore(session);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configuration de la session
console.log('🔧 Configuration de la session Express');
app.use(session({
  secret: process.env.SESSION_SECRET || 'sou9digital-secret-key',
  resave: false, // Changed back to false since we'll be using a proper store
  rolling: true, // Renouvelle la durée d'expiration à chaque requête
  saveUninitialized: false, // Éviter de créer des sessions vides
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours au lieu de 7
    httpOnly: true,
    sameSite: 'lax',
    path: '/' // Assurer que le cookie est disponible pour tout le site
  },
  name: 'sou9digital.sid' // Nom personnalisé du cookie pour éviter les conflits
}));

// Debug middleware pour les sessions 
app.use((req, res, next) => {
  console.log(`📨 Requête ${req.method} vers ${req.url}`);
  console.log(`🍪 Cookies: ${JSON.stringify(req.headers.cookie)}`);
  console.log(`🆔 Session ID: ${req.sessionID}`);
  console.log(`📝 Session: ${JSON.stringify(req.session)}`);
  next();
});

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
        try {
          // Utiliser replacer pour éviter les structures cycliques
          logLine += ` :: ${JSON.stringify(capturedJsonResponse, (key, value) => {
            // Éviter la récursion infinie sur les objets complexes
            if (key && typeof value === 'object' && value !== null) {
              return '[Object]';
            }
            return value;
          })}`;
        } catch (error) {
          logLine += ' :: [Complex Object]';
        }
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
  // Initialiser la base de données SQLite
  try {
    log("Initialisation de la base de données SQLite...", "database");
    
    // Import dynamique du module d'initialisation
    const { initializeDatabase } = await import('./initializeSqlite.js');
    await initializeDatabase();
    
    log("Base de données SQLite initialisée avec succès", "database");
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données SQLite:", error);
    process.exit(1); // Arrêter le serveur si l'initialisation échoue
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
<<<<<<< HEAD
  const port = 5002;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
=======
const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});

>>>>>>> 5b340e726c616448e38ddce542b5515bd5474ab5
})();
