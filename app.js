const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose')

mongoose.connect('mongodb://127.0.0.1:27017/mini-project')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('Connection error:', err));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req,res) =>{
    res.render('index.ejs')
})

app.get('/recipe', (req,res) => {
    res.render('show.ejs')
})

app.listen(3000, () => {
    console.log("Listening on Port 3000!")
})