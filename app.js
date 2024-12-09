const express = require("express");
const axios = require("axios");
const app = express();
const path = require("path");

const API_KEY = "01ab36ef25eb40ce993f06e63ae4a30b"; // Replace with your actual Spoonacular API key

// Simple in-memory cache (this can be further improved with a library like Redis for production)
const cache = {};

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Routes

// Home Route
app.get("/", (req, res) => {
    res.render("index", { recipes: null }); // Render search.ejs with no initial recipes
});

// Search Results Route
app.get("/search-results", async (req, res) => {
    const query = req.query.query;
    try {
        const recipeDetails = await axios.get(
            `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${query}&apiKey=${API_KEY}&number=30&addRecipeNutrition=true`
        );
        let defaultServings = 4;
        res.render("search", { recipes: recipeDetails.data.results, defaultServings });
    } catch (error) {
        console.error(error.message);
        res.render("search", { recipes: [], defaultServings }); // Render with no results in case of error
    }
});

// Recipe Details Route
app.get("/recipe/:id", async (req, res) => {
    const recipeId = req.params.id;
    const cacheKey = `recipe_${recipeId}`;

    try {
        const recipeDetails = await axios.get(
            `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
        );

        const nutritionLabel = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/nutritionLabel?apiKey=${API_KEY}`);
        const trivia = await axios.get("https://api.spoonacular.com/food/trivia/random");

        res.render("show", {
            recipe: recipeDetails.data,
            nutritionLabel: nutritionLabel.data,
            trivia: trivia.data,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error retrieving recipe details");
    }
});

// Helper function to adjust ingredients based on servings
function adjustIngredients(recipe, servings) {
    let defaultServings = recipe.servings;
    let desiredServings = parseInt(servings) || defaultServings;

    return recipe.extendedIngredients.map((ingredient) => {
        const scaledAmount = (ingredient.amount / defaultServings) * desiredServings;
        ingredient.scaledAmount = scaledAmount;
        return ingredient;
    });
}

// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
