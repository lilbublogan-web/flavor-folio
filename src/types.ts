export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  imageUrl: string;
  isFavorite?: boolean;
  author?: string;
  nutrition?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  pairings?: string[];
}

export interface MealPlan {
  id: string;
  date: string;
  recipeId: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

export interface ShoppingItem {
  id: string;
  item: string;
  amount: string;
  checked: boolean;
}

export interface UserPreferences {
  favorites: string[];
  pantry: string[];
  shoppingList: ShoppingItem[];
}
