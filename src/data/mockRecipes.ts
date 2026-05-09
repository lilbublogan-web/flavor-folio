import { Recipe } from "../types";

export const MOCK_RECIPES: Recipe[] = [
  {
    id: "1",
    title: "Summer Berry Tart",
    description: "A refreshing and light tart filled with seasonal berries and a silky pastry cream.",
    ingredients: [
      { item: "Fresh Berries", amount: "2 cups" },
      { item: "All-purpose Flour", amount: "1.5 cups" },
      { item: "Cold Butter", amount: "1/2 cup" },
      { item: "Sugar", amount: "1/4 cup" },
      { item: "Vanilla Extract", amount: "1 tsp" }
    ],
    instructions: [
      "Prepare the tart crust by mixing flour, sugar, and cold butter.",
      "Press into a tart pan and bake at 375°F for 15 minutes.",
      "Allow to cool completely.",
      "Fill with pastry cream and top with fresh berries.",
      "Chill for at least 2 hours before serving."
    ],
    cookingTime: "45 mins",
    difficulty: "Medium",
    category: "Dessert",
    imageUrl: "https://picsum.photos/seed/tart/800/600",
    author: "Chef Julian"
  },
  {
    id: "2",
    title: "Truffle Mushroom Risotto",
    description: "Creamy Arborio rice slow-cooked with earthy mushrooms and finished with truffle oil.",
    ingredients: [
      { item: "Arborio Rice", amount: "1 cup" },
      { item: "Mixed Mushrooms", amount: "250g" },
      { item: "Vegetable Broth", amount: "4 cups" },
      { item: "Truffle Oil", amount: "1 tbsp" },
      { item: "Parmesan Cheese", amount: "1/2 cup" }
    ],
    instructions: [
      "Sauté mushrooms until golden brown.",
      "Add rice and toast for 2 minutes.",
      "Gradually add warm broth, stirring constantly.",
      "Finish with parmesan and a drizzle of truffle oil."
    ],
    cookingTime: "30 mins",
    difficulty: "Hard",
    category: "Main Course",
    imageUrl: "https://picsum.photos/seed/risotto/800/600",
    author: "Elena Rossi"
  },
  {
    id: "3",
    title: "Mediterranean Quinoa Salad",
    description: "A vibrant salad with crispy cucumbers, kalamata olives, and a zesty lemon dressing.",
    ingredients: [
      { item: "Quinoa", amount: "1 cup" },
      { item: "Cucumber", amount: "1 large" },
      { item: "Feta Cheese", amount: "100g" },
      { item: "Lemon Juice", amount: "2 tbsp" },
      { item: "Olive Oil", amount: "3 tbsp" }
    ],
    instructions: [
      "Cook quinoa according to package instructions.",
      "Chop vegetables and mix in a large bowl.",
      "Whisk together oil, lemon juice, salt, and pepper.",
      "Toss everything together and serve chilled."
    ],
    cookingTime: "20 mins",
    difficulty: "Easy",
    category: "Salad",
    imageUrl: "https://picsum.photos/seed/salad/800/600",
    author: "Health Kitchen"
  },
  {
    id: "4",
    title: "Spicy Thai Basil Chicken",
    description: "A quick and flavorful stir-fry with fragrant basil and a kick of Thai bird's eye chili.",
    ingredients: [
      { item: "Ground Chicken", amount: "500g" },
      { item: "Thai Basil", amount: "1 bunch" },
      { item: "Garlic", amount: "4 cloves" },
      { item: "Soy Sauce", amount: "2 tbsp" },
      { item: "Fish Sauce", amount: "1 tbsp" }
    ],
    instructions: [
      "Stir-fry garlic and chilies until fragrant.",
      "Add chicken and cook until browned.",
      "Stir in sauces and sugar.",
      "Toss in basil leaves and serve over rice."
    ],
    cookingTime: "15 mins",
    difficulty: "Easy",
    category: "Main Course",
    imageUrl: "https://picsum.photos/seed/thai/800/600",
    author: "Siam Flavors"
  },
  {
    id: "5",
    title: "Classic Shakshuka",
    description: "Eggs poached in a simmering tomato sauce with peppers, onions, and warming spices.",
    ingredients: [
      { item: "Eggs", amount: "4" },
      { item: "Canned Tomatoes", amount: "800g" },
      { item: "Red Bell Pepper", amount: "1" },
      { item: "Cumin", amount: "1 tsp" },
      { item: "Feta Cheese", amount: "50g" }
    ],
    instructions: [
      "Sauté peppers and onions until soft.",
      "Add tomatoes and spices; simmer for 10 minutes.",
      "Make small wells and crack eggs into the sauce.",
      "Cover and cook until egg whites are set."
    ],
    cookingTime: "25 mins",
    difficulty: "Medium",
    category: "Breakfast",
    imageUrl: "https://picsum.photos/seed/eggs/800/600",
    author: "Morning Sun"
  },
  {
    id: "6",
    title: "Crispy Roasted Smashed Potatoes",
    description: "Golden, crispy potatoes infused with garlic and fresh rosemary for the ultimate side dish.",
    ingredients: [
      { item: "Baby Potatoes", amount: "500g" },
      { item: "Garlic", amount: "3 cloves" },
      { item: "Rosemary", amount: "2 sprigs" },
      { item: "Olive Oil", amount: "3 tbsp" }
    ],
    instructions: [
      "Boil potatoes until tender, then drain.",
      "Place on a baking sheet and smash gently with a fork.",
      "Drizzle with oil and toss with garlic and rosemary.",
      "Bake at 425°F until golden and crispy."
    ],
    cookingTime: "40 mins",
    difficulty: "Easy",
    category: "Side Dish",
    imageUrl: "https://picsum.photos/seed/potatoes/800/600",
    author: "Home Cook"
  },
  {
    id: "7",
    title: "Blueberry Lemon Poppy Seed Pancakes",
    description: "Fluffy pancakes bursting with fresh blueberries and a hint of citrusy lemon.",
    ingredients: [
      { item: "Flour", amount: "1.5 cups" },
      { item: "Blueberries", amount: "1 cup" },
      { item: "Lemon Zest", amount: "1 tbsp" },
      { item: "Poppy Seeds", amount: "2 tsp" }
    ],
    instructions: [
      "Whisk dry ingredients separately from wet.",
      "Fold in blueberries and lemon zest gently.",
      "Cook on a hot griddle until bubbles form, then flip.",
      "Serve with warm maple syrup."
    ],
    cookingTime: "25 mins",
    difficulty: "Easy",
    category: "Breakfast",
    imageUrl: "https://picsum.photos/seed/pancakes/800/600",
    author: "Pancake Pro"
  },
  {
    id: "8",
    title: "Rainbow Veggie Sushi Rolls",
    description: "A colorful and nutritious vegetarian takes on classic sushi with avocado and carrot.",
    ingredients: [
      { item: "Sushi Rice", amount: "2 cups" },
      { item: "Nori Sheets", amount: "5" },
      { item: "Avocado", amount: "1" },
      { item: "Carrot", amount: "1 large" }
    ],
    instructions: [
      "Spread thin layer of rice onto nori sheet.",
      "Arrange veggie strips in the center.",
      "Roll tightly using a bamboo mat.",
      "Cut into individual pieces and serve with soy sauce."
    ],
    cookingTime: "50 mins",
    difficulty: "Hard",
    category: "Main Course",
    imageUrl: "https://picsum.photos/seed/sushi/800/600",
    author: "Zen Kitchen"
  }
];
