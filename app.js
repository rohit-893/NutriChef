const express = require("express");
const axios = require("axios");
const app = express();
const path = require("path");

const API_KEY = "c380b83969ff408698f2a690b3902130"; // Replace with your actual Spoonacular API key

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
        const response = await axios.get(
            `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${query}&apiKey=${API_KEY}&number=51`
        );

        res.render("search", { recipes: response.data });
    } catch (error) {
        console.error(error.message);
        res.render("search", { recipes: [] }); // Render with no results in case of error
    }
});

// Recipe Details Route
app.get("/recipe/:id", async (req, res) => {
    const recipeId = req.params.id;

    try {
        const recipeDetails = await axios.get(
            `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
        );

        const nutritionLabel = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/nutritionLabel?apiKey=${API_KEY}`);

        res.render("show", {
            recipe: recipeDetails.data,
            nutritionLabel: nutritionLabel.data,
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Error retrieving recipe details");
    }
});

// Server Setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
