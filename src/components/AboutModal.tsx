import React from 'react';
import { X, Sparkles, Heart, Shield, Globe } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  onClose: () => void;
}

export const AboutModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
        className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-100"
      >
        <div className="relative h-48 bg-stone-900 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:20px_20px]" />
          </div>
          <div className="relative text-center">
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2 italic">FlavorFolio</h2>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">The Culinary Aesthetic</p>
          </div>
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-10 space-y-8">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-stone-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Our Vision
            </h3>
            <p className="text-sm text-stone-500 leading-relaxed italic">
              "FlavorFolio was born from a simple idea: that your recipe collection should be as beautiful as the meals you create. We've stripped away the clutter of traditional recipe sites to give you a distraction-free space for your culinary journey."
            </p>
          </section>

          <div className="grid grid-cols-2 gap-8 border-t border-stone-100 pt-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <Shield className="w-3 h-3" /> Privacy First
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Your data is yours. We never sell your recipes or meal plans. Your kitchen, your rules.
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 flex items-center gap-2">
                <Globe className="w-3 h-3" /> AI Powered
              </h4>
              <p className="text-xs text-stone-500 leading-relaxed">
                Advanced machine learning helps you generate nutritionally balanced recipes from whatever's in your fridge.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-300 uppercase tracking-widest">
              <Heart className="w-3 h-3 fill-current" /> Crafted for the modern chef
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
