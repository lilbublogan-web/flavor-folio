import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingItem } from '../types';
import { recipeService } from '../services/recipeService';

interface Props {
  onClose: () => void;
}

export const ShoppingList: React.FC<Props> = ({ onClose }) => {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    const list = await recipeService.getShoppingList();
    setItems(list);
    setIsLoading(false);
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.trim()) {
      const item: Omit<ShoppingItem, 'id'> = {
        item: newItem.trim(),
        amount: newAmount.trim() || 'some',
        checked: false
      };
      const id = await recipeService.addShoppingItem(item);
      setItems([{ ...item, id }, ...items]);
      setNewItem("");
      setNewAmount("");
    }
  };

  const toggleItem = async (id: string, currentStatus: boolean) => {
    setItems(items.map(i => i.id === id ? { ...i, checked: !currentStatus } : i));
    await recipeService.updateShoppingItem(id, { checked: !currentStatus });
  };

  const removeItem = async (id: string) => {
    setItems(items.filter(i => i.id !== id));
    await recipeService.removeShoppingItem(id);
  };

  const clearChecked = async () => {
    const checkedItems = items.filter(i => i.checked);
    setItems(items.filter(i => !i.checked));
    for (const item of checkedItems) {
      await recipeService.removeShoppingItem(item.id);
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
        className="relative w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-stone-200"
      >
        <div className="p-8 border-b border-stone-100 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-stone-900">Shopping List</h2>
            <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-1">
              {items.length} items to pick up
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 min-h-[300px]">
          <form onSubmit={addItem} className="flex gap-2">
            <input
              type="text"
              placeholder="What do you need?"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900"
            />
            <input
              type="text"
              placeholder="Qty"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="w-20 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-stone-900 text-center"
            />
            <button type="submit" className="p-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </form>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-stone-200" />
            </div>
          ) : (
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`flex items-center gap-3 p-4 rounded-2xl border transition-all group ${item.checked ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-stone-100'}`}
                  >
                    <button onClick={() => toggleItem(item.id, item.checked)} className="text-stone-300 hover:text-stone-900 transition-colors">
                      {item.checked ? <CheckCircle className="w-5 h-5 text-stone-900" /> : <Circle className="w-5 h-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${item.checked ? 'line-through text-stone-400' : 'text-stone-700'}`}>
                        {item.item}
                      </p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{item.amount}</p>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-stone-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {items.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-stone-300 text-sm italic">Your shopping list is empty</p>
                </div>
              )}
            </div>
          )}
        </div>

        {items.some(i => i.checked) && (
          <div className="p-4 bg-stone-50 border-t border-stone-200">
            <button
              onClick={clearChecked}
              className="w-full py-2 text-xs font-bold text-stone-400 hover:text-stone-900 uppercase tracking-widest transition-colors"
            >
              Clear Checked Items
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
