const express = require("express");
const axios = require("axios");
const app = express();
const path = require("path");

const API_KEY = "c380b83969ff408698f2a690b3902130"; // Replace with your actual Spoonacular API key

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

    // Check if the recipe data is cached
    if (cache[cacheKey]) {
        console.log("Serving from cache");
        const cachedRecipe = cache[cacheKey];
        const scaledIngredients = adjustIngredients(cachedRecipe, req.query.servings);
        const scaledReadyInMinutes = (cachedRecipe.readyInMinutes / cachedRecipe.servings) * parseInt(req.query.servings || cachedRecipe.servings);

        return res.render("show", {
            recipe: cachedRecipe,
            nutritionLabel: cachedRecipe.nutritionLabel,
            desiredServings: req.query.servings || cachedRecipe.servings,
            scaledIngredients,
            scaledReadyInMinutes: Math.round(scaledReadyInMinutes),
        });
    }

    try {
        // Fetch recipe details and nutrition label in parallel
        const [recipeDetails, nutritionLabel] = await Promise.all([
            axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`),
            axios.get(`https://api.spoonacular.com/recipes/${recipeId}/nutritionLabel?apiKey=${API_KEY}`)
        ]);

        const recipe = recipeDetails.data;
        const nutritionData = nutritionLabel.data;

        let defaultServings = recipe.servings;
        let desiredServings = parseInt(req.query.servings) || defaultServings;

        // Scale the ingredients based on the desired servings
        const scaledIngredients = recipe.extendedIngredients.map((ingredient) => {
            const scaledAmount = (ingredient.amount / defaultServings) * desiredServings;
            ingredient.scaledAmount = scaledAmount;
            return ingredient;
        });

        // Scale the "Ready in" time based on the servings
        const scaledReadyInMinutes = (recipe.readyInMinutes / defaultServings) * desiredServings;

        // Cache the fetched recipe data (for 5 minutes)
        cache[cacheKey] = { ...recipe, nutritionLabel: nutritionData };

        res.render("show", {
            recipe: recipeDetails.data,
            nutritionLabel: nutritionData,
            desiredServings: desiredServings,
            scaledIngredients: scaledIngredients,
            scaledReadyInMinutes: Math.round(scaledReadyInMinutes),
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