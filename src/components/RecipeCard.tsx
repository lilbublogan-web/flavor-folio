import React from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { Recipe } from '../types';

interface Props {
  recipe: Recipe;
  onToggleFavorite: (id: string) => void;
  onClick: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<Props> = ({ recipe, onToggleFavorite, onClick }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="recipe-card group cursor-pointer"
      onClick={() => onClick(recipe)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-300"
          referrerPolicy="no-referrer"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(recipe.id);
          }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm border border-stone-200"
        >
          <Heart
            className={`w-4 h-4 ${recipe.isFavorite ? 'fill-stone-900 text-stone-900' : 'text-stone-400'}`}
          />
        </button>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-base font-semibold mb-1 text-stone-900">{recipe.title}</h3>
        <p className="text-stone-500 text-xs flex gap-3">
          <span>{recipe.cookingTime}</span>
          <span>•</span>
          <span>{recipe.difficulty}</span>
        </p>
      </div>
    </motion.div>
  );
};
