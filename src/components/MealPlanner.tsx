import React, { useState, useEffect } from 'react';
import { X, Calendar, Plus, ChevronLeft, ChevronRight, Trash2, Crown, Lock, ShoppingBag, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { recipeService } from '../services/recipeService';
import { Recipe, MealPlan } from '../types';

interface Props {
  onClose: () => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
  recipes: Recipe[];
}

export const MealPlanner: React.FC<Props> = ({ onClose, isPremium, onUpgrade, recipes }) => {
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const data = await recipeService.getMealPlans();
    setPlans(data);
    setIsLoading(false);
  };

  const getDayDate = (dayOffset: number) => {
    const d = new Date(currentWeek);
    d.setDate(d.getDate() - d.getDay() + dayOffset);
    return d.toISOString().split('T')[0];
  };

  const handleAddMeal = async (date: string, mealType: typeof mealTypes[number]) => {
    if (!isPremium) return onUpgrade?.();
    
    // Simple pick for demo: just take the first recipe 
    // In a real app we'd have a search/picker
    const recipeId = recipes[0]?.id;
    if (!recipeId) return;

    const newPlan = { date, mealType, recipeId };
    const id = await recipeService.addToMealPlan(newPlan);
    setPlans([...plans, { ...newPlan, id } as MealPlan]);
  };

  const handleRemove = async (id: string) => {
    setPlans(plans.filter(p => p.id !== id));
    await recipeService.removeFromMealPlan(id);
  };

  const handleGenerateShoppingList = async () => {
    if (!isPremium) return onUpgrade?.();
    if (plans.length === 0) return;
    
    setIsGenerating(true);
    try {
      await recipeService.generateShoppingListFromPlans(plans, recipes);
      // Maybe show a success state or just close
      alert("Shopping list generated from your meal plan!");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
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
        className="relative w-full max-w-6xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-200"
      >
        <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-stone-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">Weekly Planner</h2>
              <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-0.5">
                Organize your kitchen life
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={handleGenerateShoppingList}
              disabled={isGenerating || plans.length === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                isPremium 
                ? 'bg-stone-900 text-white hover:bg-stone-800' 
                : 'bg-stone-100 text-stone-400 hover:text-stone-900'
              }`}
            >
              {isGenerating ? (
                <Sparkles className="w-3 h-3 animate-pulse" />
              ) : (
                <>
                  <ShoppingBag className="w-3 h-3" />
                  {isPremium ? 'Sync Shopping List' : 'Sync List (Plus)'}
                </>
              )}
            </button>
            <div className="flex items-center gap-4 bg-white border border-stone-200 px-4 py-2 rounded-xl">
              <button className="p-1 hover:text-stone-900 text-stone-400 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
              <span className="text-xs font-bold uppercase tracking-widest text-stone-900">This Week</span>
              <button className="p-1 hover:text-stone-900 text-stone-400 transition-colors"><ChevronRight className="w-4 h-4" /></button>
            </div>
            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-x-auto p-8">
          {!isPremium && (
            <div className="mb-8 p-6 bg-stone-900 rounded-2xl text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Crown className="w-6 h-6" />
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest">Plus Feature</h3>
                  <p className="text-xs text-stone-400 mt-1">Upgrade to save and sync your meal plans across devices.</p>
                </div>
              </div>
              <button 
                onClick={onUpgrade}
                className="px-6 py-3 bg-white text-stone-900 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-stone-50 transition-colors"
              >
                Go Plus
              </button>
            </div>
          )}

          <div className="grid grid-cols-7 gap-4 min-w-[1000px]">
            {days.map((day, i) => {
              const date = getDayDate(i);
              return (
                <div key={day} className="flex flex-col gap-4">
                  <div className="text-center py-2">
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{day}</p>
                    <p className="text-sm font-bold text-stone-900 mt-1">{date.split('-')[2]}</p>
                  </div>
                  
                  <div className={`space-y-4 flex-1 ${!isPremium ? 'opacity-40 pointer-events-none grayscale' : ''}`}>
                    {mealTypes.map(type => {
                      const plan = plans.find(p => p.date === date && p.mealType === type);
                      const recipe = recipes.find(r => r.id === plan?.recipeId);
                      
                      return (
                        <div 
                          key={type} 
                          className="group bg-stone-50 border border-stone-100 rounded-2xl p-4 min-h-[120px] flex flex-col justify-between hover:border-stone-900 transition-all cursor-pointer relative"
                          onClick={() => !plan && handleAddMeal(date, type)}
                        >
                          <div>
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mb-2">{type}</p>
                            {recipe ? (
                              <div className="space-y-2">
                                <p className="text-xs font-bold text-stone-900 line-clamp-2 leading-tight">{recipe.title}</p>
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-stone-400 font-medium">{recipe.cookingTime}</span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-stone-300">
                                <Plus className="w-3 h-3" />
                                <span className="text-[10px] font-bold tracking-widest uppercase">Add Meal</span>
                              </div>
                            )}
                          </div>
                          
                          {plan && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleRemove(plan.id); }}
                              className="absolute top-2 right-2 p-1 text-stone-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 bg-stone-50/50 border-t border-stone-100 text-center">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest leading-loose">
            Pro Tip: Automated shopping lists based on your weekly plan coming soon for Pro users.
          </p>
        </div>
      </motion.div>
    </div>
  );
};
