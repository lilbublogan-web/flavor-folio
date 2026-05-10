/// <reference types="vite/client" />
import { loadStripe } from "@stripe/stripe-js";
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  arrayUnion, 
  arrayRemove, 
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { db, auth } from "./firebase";
import { Recipe, ShoppingItem, MealPlan } from "../types";
import { MOCK_RECIPES } from "../data/mockRecipes";

interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

const handleFirestoreError = (error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) => {
  if (error.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || '',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || true,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || '',
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
};

export const recipeService = {
  getRecipes: async (): Promise<Recipe[]> => {
    try {
      const q = query(collection(db, "recipes"));
      const querySnapshot = await getDocs(q);
      const dbRecipes = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Recipe));
      
      const favorites = await recipeService.getFavorites();
      const allRecipes = [...MOCK_RECIPES, ...dbRecipes];
      
      return allRecipes.map(r => ({
        ...r,
        isFavorite: favorites.includes(r.id)
      }));
    } catch (e) {
      return handleFirestoreError(e, 'list', 'recipes');
    }
  },

  getFavorites: async (): Promise<string[]> => {
    const user = auth.currentUser;
    if (!user) return [];
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? (userDoc.data().favorites || []) : [];
    } catch (e) {
      return handleFirestoreError(e, 'get', `users/${user?.uid}`);
    }
  },

  toggleFavorite: async (recipeId: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const favorites = await recipeService.getFavorites();
      const isFavorite = favorites.includes(recipeId);
      const userRef = doc(db, "users", user.uid);
      
      await updateDoc(userRef, {
        favorites: isFavorite ? arrayRemove(recipeId) : arrayUnion(recipeId)
      });
    } catch (e) {
      handleFirestoreError(e, 'update', `users/${user?.uid}`);
    }
  },

  getPantry: async (): Promise<string[]> => {
    const user = auth.currentUser;
    if (!user) return [];
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.exists() ? (userDoc.data().pantry || []) : [];
    } catch (e) {
      return handleFirestoreError(e, 'get', `users/${user?.uid}`);
    }
  },

  updatePantry: async (pantry: string[]): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { pantry });
    } catch (e) {
      handleFirestoreError(e, 'update', `users/${user?.uid}`);
    }
  },

  getShoppingList: async (): Promise<ShoppingItem[]> => {
    const user = auth.currentUser;
    if (!user) return [];
    try {
      const q = query(collection(db, "users", user.uid, "shoppingList"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShoppingItem));
    } catch (e) {
      return handleFirestoreError(e, 'list', `users/${user?.uid}/shoppingList`);
    }
  },

  addShoppingItem: async (item: Omit<ShoppingItem, 'id'>): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Auth required");
    try {
      const itemRef = doc(collection(db, "users", user.uid, "shoppingList"));
      await setDoc(itemRef, { ...item, createdAt: serverTimestamp() });
      return itemRef.id;
    } catch (e) {
      return handleFirestoreError(e, 'create', `users/${user.uid}/shoppingList`);
    }
  },

  removeShoppingItem: async (id: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "shoppingList", id));
    } catch (e) {
      handleFirestoreError(e, 'delete', `users/${user.uid}/shoppingList/${id}`);
    }
  },

  updateShoppingItem: async (id: string, updates: Partial<ShoppingItem>): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await updateDoc(doc(db, "users", user.uid, "shoppingList", id), updates);
    } catch (e) {
      handleFirestoreError(e, 'update', `users/${user.uid}/shoppingList/${id}`);
    }
  },

  getUserProfile: async () => {
    const user = auth.currentUser;
    if (!user) return null;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) return userDoc.data();
      
      const initialProfile = {
        displayName: user.displayName || 'Guest',
        email: user.email || '',
        photoURL: user.photoURL || '',
        isPremium: false,
        pantry: [],
        favorites: [],
        generationCount: 0
      };
      await setDoc(doc(db, "users", user.uid), initialProfile);
      return initialProfile;
    } catch (e) {
      return handleFirestoreError(e, 'get', `users/${user.uid}`);
    }
  },

  generateRecipe: async (ingredients: string[], precise: boolean = false): Promise<Recipe> => {
    const user = auth.currentUser;
    const profile = user ? await recipeService.getUserProfile() : null;

    if (profile && !profile.isPremium && profile.generationCount >= 3) {
      throw new Error("Free limit reached. Upgrade to Pro for unlimited AI recipes.");
    }
    
    let recipeData;
    try {
      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, precise }),
      });
      
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response from server:", text.substring(0, 100));
        throw new Error(`The AI Laboratory returned an unexpected response. Please try again later.`);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate recipe");
      }
      recipeData = data;
    } catch (apiError: any) {
      console.error("Recipe Generation Error:", apiError);
      throw new Error(apiError.message || "The AI Chef is busy right now. Please try again later.");
    }
    
    const categoryImages: Record<string, string> = {
      'Breakfast': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=1000&auto=format&fit=crop',
      'Lunch': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop',
      'Dinner': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000&auto=format&fit=crop',
      'Dessert': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=1000&auto=format&fit=crop',
      'Common': 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000&auto=format&fit=crop'
    };
    
    const finalRecipe: Omit<Recipe, 'id'> = {
      ...recipeData,
      imageUrl: categoryImages[recipeData.category] || categoryImages['Common'],
      isFavorite: false,
      author: user?.displayName || "FlavorFolio AI",
      authorId: user?.uid || "ai-gen",
      createdAt: new Date().toISOString()
    };

    if (user) {
      try {
        const recipeRef = doc(collection(db, "recipes"));
        await setDoc(recipeRef, { ...finalRecipe, createdAt: serverTimestamp() });
        
        // Increment generation count
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          generationCount: (profile?.generationCount || 0) + 1
        });

        return { id: recipeRef.id, ...finalRecipe } as Recipe;
      } catch (e) {
        handleFirestoreError(e, 'create', 'recipes');
      }
    }

    return { 
      id: "ai-" + Date.now(), 
      ...finalRecipe 
    } as Recipe;
  },

  getMealPlans: async (): Promise<any[]> => {
    const user = auth.currentUser;
    if (!user) return [];
    try {
      const q = query(collection(db, "users", user.uid, "mealPlans"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      return handleFirestoreError(e, 'list', `users/${user.uid}/mealPlans`);
    }
  },

  addToMealPlan: async (plan: Omit<any, 'id'>): Promise<string> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Auth required");
    try {
      const planRef = doc(collection(db, "users", user.uid, "mealPlans"));
      await setDoc(planRef, { ...plan, createdAt: serverTimestamp() });
      return planRef.id;
    } catch (e) {
      return handleFirestoreError(e, 'create', `users/${user.uid}/mealPlans`);
    }
  },

  removeFromMealPlan: async (id: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) return;
    try {
      await deleteDoc(doc(db, "users", user.uid, "mealPlans", id));
    } catch (e) {
      handleFirestoreError(e, 'delete', `users/${user.uid}/mealPlans/${id}`);
    }
  },

  generateShoppingListFromPlans: async (plans: MealPlan[], recipes: Recipe[]): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Auth required");
    
    try {
      // Collect all ingredients from the planned recipes
      const itemsToSync: { item: string, amount: string }[] = [];
      
      plans.forEach(plan => {
        const recipe = recipes.find(r => r.id === plan.recipeId);
        if (recipe) {
          recipe.ingredients.forEach(ing => {
            // ing is an Ingredient object { item, amount }
            itemsToSync.push({ item: ing.item, amount: ing.amount });
          });
        }
      });
      
      // Batch add to shopping list
      for (const ingredient of itemsToSync) {
        const itemRef = doc(collection(db, "users", user.uid, "shoppingList"));
        await setDoc(itemRef, {
          item: ingredient.item,
          amount: ingredient.amount,
          checked: false,
          createdAt: serverTimestamp()
        });
      }
    } catch (e) {
      handleFirestoreError(e, 'create', `users/${user.uid}/shoppingList`);
    }
  },

  upgradeToPremium: async (): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error("Authentication required to upgrade");
    
    // Developer bypass
    if (user.email === 'lilbub.logan@gmail.com' || user.email === 'logintaylor500@gmail.com') {
      try {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { isPremium: true });
        return;
      } catch (e) {
        handleFirestoreError(e, 'update', `users/${user.uid}`);
      }
    }

    // Stripe checkout for everyone else
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.uid, email: user.email }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("The secure payment laboratory returned an unexpected response.");
      }

      const session = await response.json();
      if (session.error) throw new Error(session.error);

      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "");
      if (!stripe) throw new Error("Stripe context failure");
      
      const { error } = await (stripe as any).redirectToCheckout({ sessionId: session.id });
      if (error) throw error;
    } catch (e: any) {
      console.error("Stripe Checkout Error:", e);
      throw new Error(e.message || "Could not initialize secure payment lab.");
    }
  }
};
