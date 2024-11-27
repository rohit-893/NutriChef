const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Recipe = require('./models/recipe');

mongoose.connect('mongodb://127.0.0.1:27017/mini-project')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Connection error:', err));

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
    const skip = (page - 1) * limit;  // Skip the previous pages' recipes
    const ingredient = req.query.ingredient;
    const recipes = await Recipe.find({ TranslatedRecipeName: { $regex: ingredient, $options: 'i' } }).skip(skip)
        .limit(limit);

    const totalRecipes = await Recipe.countDocuments();
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalRecipes / limit);

    res.render('search.ejs', { recipes, page, totalPages, ingredient });
})

app.get('/show/:id', async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    const referer = req.get('Referrer') || '/';  // Get the referrer URL, or fallback to home
    res.render('show.ejs', { recipe, referer })
})

app.listen(3000, () => {
    console.log("Listening on Port 3000!");
})