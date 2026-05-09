import React, { useState } from 'react';
import { Sparkles, Loader2, Plus, X, Lock, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { recipeService } from '../services/recipeService';
import { Recipe } from '../types';

interface Props {
  onRecipeGenerated: (recipe: Recipe) => void;
  onClose: () => void;
  isPremium?: boolean;
  generationCount: number;
  onUpgrade?: () => void;
  isUpgrading?: boolean;
}

export const AIGenerator: React.FC<Props> = ({ 
  onRecipeGenerated, 
  onClose, 
  isPremium, 
  generationCount,
  onUpgrade,
  isUpgrading
}) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"normal" | "precise">("normal");

  const usesLeft = Math.max(0, 3 - generationCount);
  const isLimitReached = !isPremium && usesLeft === 0;

  const addIngredient = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (currentInput.trim() && !ingredients.includes(currentInput.trim())) {
      setIngredients([...ingredients, currentInput.trim()]);
      setCurrentInput("");
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  const generate = async () => {
    if (isLimitReached) {
      setError("Limit reached. Please upgrade to Pro.");
      return;
    }

    if (ingredients.length < 2) {
      setError("Please add at least 2 ingredients");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const recipe = await recipeService.generateRecipe(ingredients, mode === 'precise');
      onRecipeGenerated(recipe);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to generate recipe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-white rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden border border-stone-100"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-stone-900 transition-colors">
          <X className="w-5 h-5" />
        </button>

        <div className="relative z-10">
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-xl">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-3xl font-black text-stone-900 tracking-tight italic">AI Kitchen Lab</h2>
            {!isPremium && <Lock className="w-4 h-4 text-stone-300" />}
          </div>
          <p className="text-stone-500 text-center mb-10 text-sm italic">
            "Transform your pantry into a masterpiece."
          </p>

          {!isPremium && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-6 bg-stone-50 border border-stone-100 rounded-2xl flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${isLimitReached ? 'bg-red-100 text-red-600' : 'bg-stone-200 text-stone-900'}`}>
                  {isLimitReached ? <Lock className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-stone-900 uppercase tracking-widest">
                    {isLimitReached ? 'Daily Limit Reached' : `${usesLeft} Free Uses Left`}
                  </p>
                  <p className="text-[10px] text-stone-400">Upgrade for unlimited generations</p>
                </div>
              </div>
              <button 
                onClick={onUpgrade}
                disabled={isUpgrading}
                className="px-5 py-2 bg-stone-900 text-white text-[10px] font-bold rounded-xl hover:bg-stone-800 transition-colors uppercase tracking-widest disabled:opacity-50"
              >
                {isUpgrading ? 'Upgrading...' : 'Go Pro'}
              </button>
            </motion.div>
          )}

          <div className="flex bg-stone-100 p-1.5 rounded-2xl mb-2 gap-1.5">
            <button
              onClick={() => setMode("normal")}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                mode === "normal"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Normal Mode
            </button>
            <button
              onClick={() => setMode("precise")}
              className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all ${
                mode === "precise"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              Precise Mode
            </button>
          </div>
          <p className="text-[10px] text-center text-stone-400 mb-8 italic">
            {mode === 'normal' 
              ? "AI will assume basic pantry staples (salt, spice, oils) are available." 
              : "AI will use ONLY the exact ingredients you list. No extras allowed."}
          </p>

          <form onSubmit={addIngredient} className="relative mb-8">
            <input
              type="text"
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder="What's in your fridge?"
              disabled={isLimitReached}
              className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/5 transition-all italic disabled:bg-stone-50 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={isLimitReached}
              className="absolute right-2 top-2 p-2 rounded-lg bg-stone-900 text-white hover:bg-stone-800 transition-colors disabled:bg-stone-200"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="flex flex-wrap gap-2 mb-10 min-h-[48px]">
            <AnimatePresence>
              {ingredients.map((ing) => (
                <motion.span
                  key={ing}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-2 bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-700"
                >
                  {ing}
                  <button
                    onClick={() => removeIngredient(ing)}
                    className="p-0.5 hover:text-stone-900 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>

          {error && (
            <p className="text-red-500 text-xs text-center mb-4">{error}</p>
          )}

          <button
            onClick={generate}
            disabled={isLoading || ingredients.length < 2 || (!isPremium && ingredients.length > 2)}
            className="w-full bg-stone-900 text-white rounded-xl py-3.5 font-bold text-sm flex items-center justify-center gap-2 hover:bg-stone-800 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Crafting...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Recipe
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
