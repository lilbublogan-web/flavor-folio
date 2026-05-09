import React, { useState, useEffect } from 'react';
import { Sparkles, Lightbulb, GraduationCap, Utensils } from 'lucide-react';

const TIPS = [
  { type: 'Tip', icon: <Lightbulb />, content: "Store onions in old pantyhose to make them last up to 8 months." },
  { type: 'Joke', icon: <Utensils />, content: "Why did the chef go to jail? He beat the eggs!" },
  { type: 'Lesson', icon: <GraduationCap />, content: "A pinch of salt in your coffee reduces bitterness better than sugar." },
  { type: 'Tip', icon: <Lightbulb />, content: "Freeze leftover coffee in ice cube trays for iced coffee that doesn't get watered down." },
  { type: 'Lesson', icon: <GraduationCap />, content: "Always rest your meat for at least 5 minutes after cooking to keep it juicy." },
  { type: 'Fact', icon: <Utensils />, content: "Honey is the only food that never expires. Archeologists found edible honey in ancient tombs!" },
  { type: 'Tip', icon: <Lightbulb />, content: "To peel garlic easily, put it in a mason jar and shake it vigorously." },
  { type: 'Joke', icon: <Utensils />, content: "What do you call a fake noodle? An Impasta!" },
  { type: 'Pro', icon: <Sparkles />, content: "Pro members get 1-on-1 AI nutritional coaching and wine pairings." }
];

export const RotatingTips = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const current = TIPS[index];

  return (
    <div className="bg-stone-900 p-6 rounded-2xl text-white transition-all duration-500 min-h-[140px] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 flex items-center gap-2">
          {current.type === 'Plus' ? <Sparkles className="w-3" /> : current.type}
        </p>
        <div className="opacity-40">{React.cloneElement(current.icon as React.ReactElement, { className: 'w-3 h-3' })}</div>
      </div>
      <p className="text-xs leading-relaxed font-medium mt-1">
        {current.content}
      </p>
      <div className="mt-auto pt-4 flex gap-1">
        {TIPS.map((_, i) => (
          <div key={i} className={`h-0.5 rounded-full transition-all duration-500 ${i === index ? 'w-4 bg-white' : 'w-1 bg-white/20'}`} />
        ))}
      </div>
    </div>
  );
};
