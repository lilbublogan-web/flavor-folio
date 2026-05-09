import React from 'react';
import { X, Clock, ChefHat, Heart, Printer, Share2, Crown, Lock, GlassWater, Activity, Timer, Play, Pause, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Recipe } from '../types';

interface Props {
  recipe: Recipe | null;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
}

export const RecipeDetail: React.FC<Props> = ({ recipe, onClose, onToggleFavorite, isPremium, onUpgrade }) => {
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);

  React.useEffect(() => {
    let interval: any;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  if (!recipe) return null;

  const handlePrint = () => {
    if (!isPremium) return onUpgrade?.();
    window.print();
  };

  const startTimer = (minutes: number) => {
    if (!isPremium) return onUpgrade?.();
    setTimeLeft(minutes * 60);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
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
          className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-stone-100"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 border border-stone-200 text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Side: Image & Pro Panel */}
          <div className="w-full md:w-5/12 h-64 md:h-auto border-b md:border-b-0 md:border-r border-stone-100 flex flex-col">
            <div className="flex-1 min-h-0 relative">
              <img
                src={recipe.imageUrl}
                alt={recipe.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              {isTimerRunning && (
                <div className="absolute top-6 left-6 bg-stone-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 flex items-center gap-3">
                  <Timer className="w-4 h-4 text-white animate-pulse" />
                  <span className="text-white font-mono font-bold text-sm tracking-widest">{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
            
            <div className="p-8 hidden md:block bg-stone-50/50">
              <div className="flex items-center justify-between mb-4">
                <div className="sidebar-label !mb-0 flex items-center gap-2">
                  <Activity className="w-3 h-3" /> Nutrition
                </div>
                {!isPremium && <Lock className="w-3 h-3 text-stone-300" />}
              </div>
              
              <div className={`space-y-3 transition-all ${!isPremium ? 'blur-[4px] pointer-events-none opacity-50' : ''}`}>
                <div className="flex justify-between text-xs border-b border-stone-100 pb-2">
                  <span className="text-stone-400">Calories</span>
                  <span className="text-stone-900 font-bold">{recipe.nutrition?.calories || 0} kcal</span>
                </div>
                <div className="flex justify-between text-xs border-b border-stone-100 pb-2">
                  <span className="text-stone-400">Protein</span>
                  <span className="text-stone-900 font-bold">{recipe.nutrition?.protein || '—'}</span>
                </div>
                <div className="flex justify-between text-xs border-b border-stone-100 pb-2">
                  <span className="text-stone-400">Carbs</span>
                  <span className="text-stone-900 font-bold">{recipe.nutrition?.carbs || '—'}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-400">Fat</span>
                  <span className="text-stone-900 font-bold">{recipe.nutrition?.fat || '—'}</span>
                </div>
              </div>

              {!isPremium ? (
                <button 
                  onClick={onUpgrade}
                  className="w-full mt-6 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  <Crown className="w-3 h-3" /> Reveal Pro Insights
                </button>
              ) : (
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Smart Timer</p>
                    <Timer className="w-3 h-3 text-stone-400" />
                  </div>
                  <div className="flex gap-2">
                    {[5, 10, 15].map(m => (
                      <button 
                        key={m} 
                        onClick={() => startTimer(m)}
                        className="flex-1 py-2 bg-white border border-stone-200 rounded-lg text-[10px] font-bold hover:border-stone-900 transition-colors"
                      >
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-7/12 p-8 md:p-12 overflow-y-auto bg-white custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                {recipe.category}
                <span className="w-1 h-1 bg-stone-200 rounded-full" />
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {recipe.cookingTime}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handlePrint}
                  className="p-2.5 rounded-full border border-stone-100 bg-white text-stone-400 hover:text-stone-900 hover:border-stone-900 transition-all"
                  title="Print Recipe (Pro)"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onToggleFavorite(recipe.id)}
                  className={`p-2.5 rounded-full border transition-all ${recipe.isFavorite ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white border-stone-100 text-stone-400 hover:text-stone-900'}`}
                >
                  <Heart className={`w-4 h-4 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            <h2 className="text-4xl md:text-5xl font-black text-stone-900 mb-6 tracking-tight leading-[0.9]">
              {recipe.title}
            </h2>
            <p className="text-stone-500 mb-10 text-sm leading-relaxed italic border-l-2 border-stone-100 pl-6">
              {recipe.description}
            </p>

            <div className="grid gap-12">
              <section>
                <h3 className="sidebar-label flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-900 rounded-full" /> Ingredients
                </h3>
                <div className="space-y-3">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex justify-between items-center text-xs border-b border-stone-200 pb-2">
                      <span className="text-stone-700 font-medium">{typeof ing === 'string' ? ing : ing.item}</span>
                      <span className="text-stone-400 font-bold tabular-nums">{typeof ing === 'string' ? '' : ing.amount}</span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="sidebar-label flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-stone-900 rounded-full" /> Method
                </h3>
                <div className="space-y-6">
                  {recipe.instructions.map((step, i) => (
                    <div key={i} className="space-y-2">
                      <span className="text-[10px] font-black text-stone-900 uppercase tracking-widest">Step {i + 1}</span>
                      <p className="text-stone-600 text-sm leading-relaxed font-medium">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {recipe.pairings && recipe.pairings.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <div className="sidebar-label !mb-0 flex items-center gap-2">
                      <GlassWater className="w-3 h-3" /> Pro Pairings
                    </div>
                    {!isPremium && <Crown className="w-3 h-3 text-stone-900" />}
                  </div>
                  
                  <div className={`flex flex-wrap gap-3 transition-all ${!isPremium ? 'blur-[4px] pointer-events-none opacity-50' : ''}`}>
                    {recipe.pairings.map((p, i) => (
                      <span key={i} className="px-4 py-2 bg-stone-100 text-stone-900 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-stone-200">
                        {p}
                      </span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
