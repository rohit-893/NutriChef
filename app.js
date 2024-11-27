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

app.post('/', async (req, res) => {
    const ingredient = req.body.ingredient;
    const recipes = await Recipe.find({ TranslatedRecipeName: { $regex: ingredient, $options: 'i' } }).limit(50);
    res.render('search.ejs', { recipes });
})

app.get('/show/:id', async (req, res) => {
    const { id } = req.params;
    const recipe = await Recipe.findById(id);
    console.log(recipe)
    res.render('show.ejs', { recipe, id })
})

app.listen(3000, () => {
    console.log("Listening on Port 3000!");
})