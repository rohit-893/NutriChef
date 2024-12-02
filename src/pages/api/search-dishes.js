export default function handler(req, res) {
    // Check if the method is GET
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method Not Allowed' });
    }
  
    const { ingredients } = req.query;
  
    // Check if ingredients are provided
    if (!ingredients) {
      return res.status(400).json({ message: 'Ingredients are required' });
    }
  
    const ingredientList = ingredients.split(',').map(i => i.trim());
  
    // Simulate a dish search based on ingredients
    const allDishes = [
      { id: 1, name: 'Tomato Soup', ingredients: ['tomato', 'onion'] },
      { id: 2, name: 'Onion Rings', ingredients: ['onion', 'flour'] },
      // Add more dishes...
    ];
  
    const filteredDishes = allDishes.filter(dish => 
      ingredientList.every(ingredient => dish.ingredients.includes(ingredient))
    );
  
    // Return filtered dishes
    return res.status(200).json(filteredDishes);
  };
  