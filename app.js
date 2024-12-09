const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios'); // Import Axios

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
})

// app.get('/recipe', (req, res) => {
//     res.render('show.ejs');
// })

app.get('/search', async (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Get the page number from the query parameter (default to 1)
    const limit = 10;  // Number of recipes to show per page
    const ingredient = req.query.ingredient;
    const response = await axios.get(
        `https://api.spoonacular.com/recipes/findByIngredients?apiKey=c380b83969ff408698f2a690b3902130&ingredients=${ingredient}&number=50`
    );
    const searchResults = response.data;
    const defaultServings = 4;

    const totalRecipes = searchResults.length;
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalRecipes / limit);

    res.render('search', {
        searchResults,
        page,
        totalPages,
        ingredient,
        defaultServings
    });
})

app.get('/show/:id?', async (req, res) => {
    const { id } = req.params;
    const desiredServings = parseInt(req.query.servings) || 4; // Get desired servings or default to 1
    const defaultServings = desiredServings;
    try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=c380b83969ff408698f2a690b3902130&nutrition=false`);
        const recipe = response.data;
        console.log(recipe);
        // Adjust ingredient amounts based on desired servings
        const originalServings = recipe.servings;
        const ingredientMap = new Map();

        recipe.extendedIngredients.forEach(ingredient => {
            const adjustedAmount = (ingredient.amount / originalServings) * desiredServings;

            // Merge duplicate ingredients by name
            if (ingredientMap.has(ingredient.name)) {
                const existing = ingredientMap.get(ingredient.name);
                existing.adjustedAmount += adjustedAmount;
            } else {
                ingredientMap.set(ingredient.name, {
                    ...ingredient,
                    adjustedAmount
                });
            }
        });

        const adjustedIngredients = Array.from(ingredientMap.values());

        const referer = req.get('Referrer') || '/'; // Get the referrer URL, or fallback to home

        const nutritionLabel = await axios.get("https://api.spoonacular.com/recipes/<%= recipe.id %>/nutritionLabel.png?apiKey=c380b83969ff408698f2a690b3902130");

        // Pass the adjusted ingredients and desired servings to the template
        res.render('show', {
            recipe,
            adjustedIngredients,
            referer,
            defaultServings,
            nutritionLabel: nutritionLabel.data,
        });
    } catch (error) {
        console.error('Error fetching recipe detail:', error.message);
        res.status(500).send("Something went wrong while fetching the recipe.");
    }
});

app.listen(3000, () => {
    console.log("Listening on Port 3000!");
})