import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add CORS support
  app.use(cors());

  // Stripe helper
  let stripe: Stripe | null = null;
  const getStripe = () => {
    if (!stripe) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error("STRIPE_SECRET_KEY is not configured");
      }
      stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
    return stripe;
  };

  // Firebase Admin setup
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin initialized with service account");
      } catch (e) {
        console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT, falling back to default credentials");
        admin.initializeApp();
      }
    } else {
      // Falls back to default credentials in Google Cloud environment
      admin.initializeApp();
      console.log("Firebase Admin initialized with default credentials");
    }
  } catch (error) {
    console.error("Firebase Admin initialization failed. Premium features like webhooks will be disabled.", error);
  }

  const db = admin.apps.length ? admin.firestore() : null;

  // Global logging middleware
  app.use((req, res, next) => {
    console.log(`[Server] ${req.method} ${req.url}`);
    next();
  });

  // API Routes
  app.use(express.json());

  app.post("/api/create-checkout-session", async (req, res) => {
    const { userId, email } = req.body;

    try {
      const stripeClient = getStripe();
      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "FlavorFolio Pro",
                description: "Unlimited AI Recipe Lab generations & more.",
              },
              unit_amount: 500, // $5.00
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${req.headers.origin}?success=true`,
        cancel_url: `${req.headers.origin}?canceled=true`,
        metadata: {
          userId,
        },
        customer_email: email,
      });

      res.json({ id: session.id });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    let event;

    try {
      const stripeClient = getStripe();
      event = stripeClient.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET || ""
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;

      if (userId && db) {
        await db.collection("users").doc(userId).update({
          isPremium: true,
        });
      } else if (!db) {
        console.error("Cannot update user premium status: Firestore DB is not initialized.");
      }
    }

    res.json({ received: true });
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Catch-all for missing API routes to prevent HTML fallbacks
  app.all("/api/*", (req, res) => {
    res.status(404).json({ 
      error: `API route not found: ${req.method} ${req.originalUrl}`,
      message: "The AI Lab server is running but this specific workstation is unreachable."
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
