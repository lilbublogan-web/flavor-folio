import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Search, Refrigerator, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { recipeService } from '../services/recipeService';

interface Props {
  onClose: () => void;
}

export const PantryExplorer: React.FC<Props> = ({ onClose }) => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [newIng, setNewIng] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPantry();
  }, []);

  const fetchPantry = async () => {
    const list = await recipeService.getPantry();
    setIngredients(list);
    setIsLoading(false);
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newIng.trim() && !ingredients.includes(newIng.trim())) {
      const newList = [newIng.trim(), ...ingredients];
      setIngredients(newList);
      setNewIng("");
      await recipeService.updatePantry(newList);
    }
  };

  const removeItem = async (item: string) => {
    const newList = ingredients.filter(i => i !== item);
    setIngredients(newList);
    await recipeService.updatePantry(newList);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-md"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-200"
      >
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center shadow-lg">
              <Refrigerator className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">Pantry Explorer</h2>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                {ingredients.length} items in stock
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 min-h-[400px]">
          <form onSubmit={addItem} className="relative mb-10">
            <input
              type="text"
              placeholder="Add an ingredient you have..."
              value={newIng}
              onChange={(e) => setNewIng(e.target.value)}
              className="w-full bg-stone-100 border border-stone-200 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
            <button type="submit" className="absolute right-2 top-2 p-2 bg-stone-900 text-white rounded-xl hover:bg-stone-800">
              <Plus className="w-6 h-6" />
            </button>
          </form>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-stone-100" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence initial={false}>
                {ingredients.map((ing) => (
                  <motion.div
                    key={ing}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between bg-stone-50 border border-stone-100 p-3 rounded-xl group"
                  >
                    <span className="text-sm font-medium text-stone-700 truncate">{ing}</span>
                    <button onClick={() => removeItem(ing)} className="p-1 text-stone-200 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {!isLoading && ingredients.length === 0 && (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-stone-100 mx-auto mb-4" />
              <p className="text-stone-300 text-sm font-medium">Your pantry is currently empty</p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-[0.2em] mt-2">Add items to get cooking</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-stone-50/50 border-t border-stone-100">
          <p className="text-[10px] text-stone-400 font-bold text-center uppercase tracking-widest leading-loose">
            Items added here will be used to suggest recipes in the AI Lab
          </p>
        </div>
      </motion.div>
    </div>
  );
};
