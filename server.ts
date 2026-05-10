import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Stripe from "stripe";
import admin from "firebase-admin";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

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

  app.post("/api/generate-recipe", async (req, res) => {
    const { ingredients, precise } = req.body;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("[Server] GEMINI_API_KEY is missing from environment");
      return res.status(500).json({ error: "AI Laboratory is currently offline (Missing API Key on Server)." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const modeInstructions = precise 
        ? "STRICT REQUIREMENT: Use ONLY the ingredients listed. DO NOT add any extra ingredients, even common ones like oil, salt, water, or spices, unless they are explicitly in the provided list. No substitutions allowed. The recipe MUST be possible using ONLY these items."
        : "You may assume common pantry staples like salt, oil, and basic spices are available if they complement the provided ingredients.";

      const prompt = `Act as a world-class chef and nutritionist. Create a unique, delicious, and healthy recipe using these ingredients: ${ingredients.join(", ")}. 

${modeInstructions}

Ensure the cooking instructions are clear and professional. Return the recipe in JSON format.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    amount: { type: Type.STRING }
                  },
                  required: ["item", "amount"]
                }
              },
              instructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              cookingTime: { type: Type.STRING },
              difficulty: {
                type: Type.STRING,
                enum: ["Easy", "Medium", "Hard"]
              },
              category: { 
                type: Type.STRING,
                enum: ["Breakfast", "Lunch", "Dinner", "Dessert"]
              },
              nutrition: {
                type: Type.OBJECT,
                properties: {
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.STRING },
                  carbs: { type: Type.STRING },
                  fat: { type: Type.STRING }
                },
                required: ["calories", "protein", "carbs", "fat"]
              },
              pairings: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["title", "description", "ingredients", "instructions", "cookingTime", "difficulty", "category", "nutrition", "pairings"]
          }
        }
      });

      const text = response.text;
      
      if (!text) {
        throw new Error("Gemini returned an empty response");
      }
      
      console.log("[Server] Gemini response received");
      try {
        const parsedData = JSON.parse(text);
        res.json(parsedData);
      } catch (parseError) {
        console.error("[Server] JSON Parse Error from Gemini:", text);
        res.status(500).json({ 
          error: "The AI Chef's handwriting is illegible.",
          details: "Invalid JSON returned by AI" 
        });
      }
    } catch (error: any) {
      console.error("[Server] Gemini Error:", error);
      res.status(500).json({ error: error.message || "The AI Chef is busy right now. Please try again later." });
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
