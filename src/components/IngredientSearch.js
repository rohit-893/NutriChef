'use client';
import { useState } from 'react';
import axios from 'axios';

const IngredientSearch = () => {
  const [ingredients, setIngredients] = useState('');
  const [dishes, setDishes] = useState([]);
  const [searched, setSearched] = useState(false);

  const searchDishes = async () => {
    if (!ingredients) return;

    try {
      const ingredientList = ingredients.split(',').map((ingredient) => ingredient.trim());

      const response = await axios.get('/api/search-dishes', {
        params: {
          ingredients: ingredientList.join(','),
        },
      });

      setDishes(response.data);
      setSearched(true);
    } catch (error) {
      console.error('Error fetching dishes:', error);
    }
  };

  return (
    <div className="my-2 p-6 bg-gray-100">
      
      <section id="ingredient-search" className="py-10 px-5">
      <h1 className='text-2xl'><b>Search Here</b></h1>
        <input
          type="text"
          placeholder="Enter Ingredients (comma separated)"
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          className="p-3 w-full rounded-lg border border-gray-300"
        />
        <button
          onClick={searchDishes}
          className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-full active:bg-orange-700" // Add active state for better mobile UX
          style={{ zIndex: 10 }} // Ensure button is above other elements
        >
          Get
        </button>
      </section>

      <div className="mt-4">
        {searched && dishes.length === 0 ? (
          <p className='px-6'>No dishes found with those ingredients.</p>
        ) : (
          dishes.map((dish) => (
            <div key={dish.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
              <h3>{dish.name}</h3>
              <a href={`/recipes/${dish.id}`} className="text-blue-500">Recipe Link</a>
            </div>
          ))
        )}
      </div>
      <h1 className='py-4 px-6 text-2xl font-bold'>Featured Dishes</h1>
    </div>
    
  );
};

export default IngredientSearch;
