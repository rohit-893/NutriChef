const express = require('express');
const app = express();
const path = require('path');
const axios = require('axios'); // Import Axios

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index.ejs');
})

// app.get('/recipe', (req, res) => {
//     res.render('show.ejs');
// })

app.get('/search', async (req, res) => {
    const page = parseInt(req.query.page) || 1;  // Get the page number from the query parameter (default to 1)
    const limit = 10;  // Number of recipes to show per page
    const ingredient = req.query.ingredient;
    const response = await axios.get(`https://api.spoonacular.com/food/search?apiKey=c380b83969ff408698f2a690b3902130&query=${ingredient}&number=50`);
    const recipes = response.data;
    const searchResults = response.data.searchResults[0].results;


    const totalRecipes = searchResults.length;
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalRecipes / limit);

    res.render('search.ejs', { searchResults, page, totalPages, ingredient });
})

app.get('/show/:id', async (req, res) => {
    const { id } = req.params;
    const desiredServings = parseInt(req.query.servings) || 4; // Get desired servings or default to 1

    try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=c380b83969ff408698f2a690b3902130&includeNutrition=false`);
        const recipe = response.data;

        // Adjust ingredient amounts based on desired servings
        const originalServings = recipe.servings;
        const adjustedIngredients = recipe.extendedIngredients.map(ingredient => {
            const adjustedAmount = (ingredient.amount / originalServings) * desiredServings;
            return { ...ingredient, adjustedAmount }; // Add the adjusted amount to the ingredient object
        });

        const referer = req.get('Referrer') || '/'; // Get the referrer URL, or fallback to home

        // Pass the adjusted ingredients and desired servings to the template
        res.render('show.ejs', { recipe, adjustedIngredients, referer, servings: desiredServings });
    } catch (error) {
        console.error('Error fetching recipe data:', error.message);
        res.status(500).send("Something went wrong while fetching the recipe.");
    }
});

app.listen(3000, () => {
    console.log("Listening on Port 3000!");
})