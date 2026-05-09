import React, { useState, useEffect, useMemo } from 'react';
import { Search, Heart, Sparkles, Plus, ChefHat, Filter, Refrigerator, ShoppingBag, Calendar, User, LogIn, LogOut, Loader2, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { loadStripe } from '@stripe/stripe-js';
import { auth } from './services/firebase';
import { Recipe, MealPlan } from './types';
import { recipeService } from './services/recipeService';
import { RecipeCard } from './components/RecipeCard';
import { RecipeDetail } from './components/RecipeDetail';
import { AIGenerator } from './components/AIGenerator';
import { ShoppingList } from './components/ShoppingList';
import { PantryExplorer } from './components/PantryExplorer';
import { MealPlanner } from './components/MealPlanner';
import { AboutModal } from './components/AboutModal';

import { RotatingTips } from './components/RotatingTips';

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [isShoppingOpen, setIsShoppingOpen] = useState(false);
  const [isPantryOpen, setIsPantryOpen] = useState(false);
  const [isMealPlanOpen, setIsMealPlanOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          const profile = await recipeService.getUserProfile();
          setUserProfile(profile);
        } else {
          setUserProfile(null);
        }
      } catch (error) {
        console.error("Profile load failed", error);
      } finally {
        setIsAuthenticating(false);
        loadRecipes();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success')) {
      // Clear URL to prevent re-triggering notification on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
      // Optional: Refresh profile to show Pro badge immediately
      recipeService.getUserProfile().then(profile => setUserProfile(profile));
    }
  }, []);

  const loadRecipes = async () => {
    const data = await recipeService.getRecipes();
    setRecipes(data);
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Force reload to clear all states and potential session issues
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return handleLogin();
    setIsUpgrading(true);
    try {
      await recipeService.upgradeToPremium();
      const profile = await recipeService.getUserProfile();
      setUserProfile(profile);
      alert("Welcome to FlavorFolio Pro! All features unlocked.");
    } catch (error) {
      console.error("Upgrade failed", error);
      alert("Upgrade failed. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    if (!user) return handleLogin();
    await recipeService.toggleFavorite(id);
    setRecipes(prev => prev.map(r => 
      r.id === id ? { ...r, isFavorite: !r.isFavorite } : r
    ));
    if (selectedRecipe?.id === id) {
      setSelectedRecipe(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
    // Update local profile favorites
    setUserProfile((prev: any) => ({
      ...prev,
      favorites: prev.favorites.includes(id) 
        ? prev.favorites.filter((fid: string) => fid !== id) 
        : [...prev.favorites, id]
    }));
  };

  const handleRecipeGenerated = (newRecipe: Recipe) => {
    setRecipes(prev => [newRecipe, ...prev]);
    setSelectedRecipe(newRecipe);
  };

  const categories = useMemo(() => {
    const cats = new Set(recipes.map(r => r.category));
    return ["All", ...Array.from(cats)];
  }, [recipes]);

  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || r.category === selectedCategory;
      const matchesFavorites = !showFavoritesOnly || r.isFavorite;
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [recipes, searchQuery, selectedCategory, showFavoritesOnly]);

  if (isAuthenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col p-6 md:p-10 max-w-[1400px] mx-auto selection:bg-stone-200">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => {
          setSelectedCategory("All");
          setShowFavoritesOnly(false);
          setSearchQuery("");
        }}>
          <div className="w-10 h-10 bg-stone-900 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <ChefHat className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">FlavorFolio</h1>
        </div>

        <div className="flex flex-col md:flex-row flex-1 max-w-3xl gap-4 md:gap-8 items-center justify-end">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-stone-900 transition-colors" />
            <input
              type="text"
              placeholder="Search meals, pantry, or soul..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input w-full pl-10 pr-4 py-3 bg-white border-stone-200"
            />
          </div>
          <nav className="flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-400">
            <button 
              onClick={() => {
                if (!user) return handleLogin();
                setIsMealPlanOpen(true);
              }}
              className="hover:text-stone-900 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" /> Plan
            </button>
            <button onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className={`transition-colors flex items-center gap-2 ${showFavoritesOnly ? 'text-stone-900' : 'hover:text-stone-900'}`}>
              <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} /> Liked
            </button>
            
            {user ? (
              <div className="flex items-center gap-6 border-l border-stone-200 pl-8">
                {userProfile?.isPremium && (
                  <div className="flex items-center gap-1.5 text-stone-900 bg-stone-100 px-3 py-1 rounded-full text-[10px]">
                    <Crown className="w-3 h-3" /> PRO
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="relative group/user">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full cursor-pointer border border-stone-200" />
                    ) : (
                      <div className="w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-stone-200 transition-colors">
                        <User className="w-4 h-4 text-stone-400" />
                      </div>
                    )}
                    <div className="absolute right-0 top-10 w-48 bg-white border border-stone-100 rounded-2xl p-2 shadow-xl opacity-0 invisible group-hover/user:opacity-100 group-hover/user:visible transition-all z-50">
                      <div className="p-3 border-b border-stone-50 mb-1">
                        <p className="text-stone-900 font-bold truncate">{user.displayName}</p>
                        <p className="text-stone-400 lowercase italic truncate">{user.email}</p>
                      </div>
                      {!userProfile?.isPremium && (
                        <button onClick={handleUpgrade} disabled={isUpgrading} className="w-full text-left p-3 hover:bg-stone-50 rounded-xl text-stone-900 font-semibold flex items-center justify-between">
                          Upgrade to Pro {isUpgrading && <Loader2 className="w-3 h-3 animate-spin" />}
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-stone-400 hover:text-red-500 transition-colors font-bold text-[10px] uppercase tracking-widest"
                  >
                    <LogOut className="w-3 h-3" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={handleLogin} className="flex items-center gap-2 text-stone-900 hover:text-stone-600 transition-colors">
                <LogIn className="w-4 h-4" /> Login
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-16 flex-1">
        {/* Sidebar */}
        <aside className="space-y-12">
          <div>
            <h3 className="sidebar-label flex items-center justify-between">
              Collections
              <span className="text-[10px] bg-stone-100 px-2 py-0.5 rounded-full text-stone-500">{filteredRecipes.length}</span>
            </h3>
            <div className="flex flex-col gap-4 mt-6">
              <div 
                onClick={() => {
                  setShowFavoritesOnly(false);
                  setSelectedCategory("All");
                }}
                className={`category-item cursor-pointer flex items-center gap-2 ${!showFavoritesOnly && selectedCategory === "All" ? "category-item-active" : ""}`}
              >
                All Recipes
              </div>
              <div 
                onClick={() => {
                  if (!user) return handleLogin();
                  setShowFavoritesOnly(true);
                }}
                className={`category-item cursor-pointer flex items-center gap-2 ${showFavoritesOnly ? "category-item-active" : ""}`}
              >
                Favorites
              </div>
              {categories.filter(c => c !== "All").map(cat => (
                <div 
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setShowFavoritesOnly(false);
                  }}
                  className={`category-item cursor-pointer ${selectedCategory === cat && !showFavoritesOnly ? "category-item-active" : ""}`}
                >
                  {cat}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="sidebar-label">Kitchen Tools</h3>
            <div className="flex flex-col gap-4 mt-6">
              <button 
                onClick={() => {
                  if (!user) return handleLogin();
                  setIsPantryOpen(true);
                }}
                className="category-item flex items-center gap-3 group w-full text-left"
              >
                <Refrigerator className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                Pantry Explorer
              </button>
              <button 
                onClick={() => {
                  if (!user) return handleLogin();
                  setIsShoppingOpen(true);
                }}
                className="category-item flex items-center gap-3 group w-full text-left"
              >
                <ShoppingBag className="w-4 h-4 text-stone-300 group-hover:text-stone-900 transition-colors" />
                Shopping List
              </button>
              <button 
                onClick={() => setIsAboutOpen(true)}
                className="category-item flex items-center gap-3 group w-full text-left"
              >
                <div className="w-4 h-4 rounded-full border border-stone-200 border-dashed" />
                The FlavorFolio Vision
              </button>
            </div>
          </div>

          <div className="pt-8 opacity-40 hover:opacity-100 transition-opacity">
            <RotatingTips />
          </div>
        </aside>

        {/* Recipe Grid */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-stone-900 flex items-center gap-2">
              Viewing: 
              <span className="text-stone-400">
                {showFavoritesOnly ? 'Favorites' : selectedCategory}
              </span>
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <Filter className="w-3 h-3" /> Sort by: Newest
            </div>
          </div>

          {filteredRecipes.length > 0 ? (
            <motion.div 
              layout
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence mode="popLayout">
                {filteredRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.id}
                    recipe={recipe}
                    onToggleFavorite={handleToggleFavorite}
                    onClick={setSelectedRecipe}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-40 text-center border-2 border-dashed border-stone-200 rounded-[3rem] bg-stone-50/30">
              <div className="w-16 h-16 bg-white border border-stone-200 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Search className="w-6 h-6 text-stone-300" />
              </div>
              <h3 className="text-xl font-bold text-stone-900 mb-3 tracking-tight">Nothing on the menu</h3>
              <p className="text-stone-400 max-w-sm text-sm font-medium leading-relaxed">
                We couldn't find any recipes matching your current filter. Try broadening your gaze or use the AI Lab.
              </p>
              <button 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setShowFavoritesOnly(false);
                }}
                className="mt-8 text-xs font-bold uppercase tracking-widest text-stone-900 border-b border-stone-900 pb-1"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => {
          if (!user) return handleLogin();
          setIsGeneratorOpen(true);
        }}
        className="fab fixed bottom-10 right-10 z-40 group flex items-center gap-3 pl-6 pr-8 h-14"
      >
        <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
        AI Recipe Lab
      </button>

      {/* Overlays */}
      <RecipeDetail
        recipe={selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
        onToggleFavorite={handleToggleFavorite}
        isPremium={userProfile?.isPremium}
        onUpgrade={handleUpgrade}
      />

      <AnimatePresence>
        {isGeneratorOpen && (
          <AIGenerator
            onRecipeGenerated={handleRecipeGenerated}
            onClose={() => setIsGeneratorOpen(false)}
            isPremium={userProfile?.isPremium}
            generationCount={userProfile?.generationCount || 0}
            onUpgrade={handleUpgrade}
            isUpgrading={isUpgrading}
          />
        )}
        {isShoppingOpen && (
          <ShoppingList onClose={() => setIsShoppingOpen(false)} />
        )}
        {isPantryOpen && (
          <PantryExplorer onClose={() => setIsPantryOpen(false)} />
        )}
        {isMealPlanOpen && (
          <MealPlanner 
            onClose={() => setIsMealPlanOpen(false)} 
            isPremium={userProfile?.isPremium}
            onUpgrade={handleUpgrade}
            recipes={recipes}
          />
        )}
        {isAboutOpen && (
          <AboutModal 
            onClose={() => setIsAboutOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

