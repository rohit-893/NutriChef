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
    const { query, vegetarian, vegan, glutenFree, ketogenic, dairy, grain, peanut, seafood, soy, wheat } = req.query;
    try {
        let apiUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${query}`;

        if (vegetarian) apiUrl += '&diet=vegetarian';
        if (vegan) apiUrl += '&diet=vegan';
        if (glutenFree) apiUrl += '&diet=glutenFree';
        if (ketogenic) apiUrl += '&diet=ketogenic';

        const intolerances = [];
        if (dairy) intolerances.push('dairy');
        if (grain) intolerances.push('grain');
        if (peanut) intolerances.push('peanut');
        if (seafood) intolerances.push('seafood');
        if (soy) intolerances.push('soy');
        if (wheat) intolerances.push('wheat');
        if (intolerances.length > 0) {
            apiUrl += `&intolerances=${intolerances.join(',')}`;
        }

        const recipeDetails = await axios.get(apiUrl);

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
        const adjustedTime = adjustReadyTime(cachedRecipe.readyInMinutes, req.query.servings);
        return res.render("show", {
            recipe: cachedRecipe,
            nutritionLabel: cachedRecipe.nutritionLabel,
            desiredServings: req.query.servings || cachedRecipe.servings,
            scaledIngredients,
            adjustedTime,
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

        // Cache the fetched recipe data (for 5 minutes)
        cache[cacheKey] = { ...recipe, nutritionLabel: nutritionData };

        const adjustedTime = adjustReadyTime(recipe.readyInMinutes, desiredServings);

        res.render("show", {
            recipe,
            nutritionLabel: nutritionData,
            desiredServings,
            scaledIngredients,
            adjustedTime,
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

// Helper function to adjust preparation time
function adjustReadyTime(readyInMinutes, servings) {
    const servingsCount = parseInt(servings);
    if (servingsCount > 20) {
        return readyInMinutes * 3; // Triple time if servings > 20
    } else if (servingsCount > 10) {
        return readyInMinutes * 2; // Double time if servings > 10
    }
    return readyInMinutes; // Default time otherwise
}

// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
