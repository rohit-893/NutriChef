const mongoose = require("mongoose");

// Define the schema for the recipe collection
const recipeSchema = new mongoose.Schema({
  Srno: { type: Number, required: true }, // Serial number of the recipe
  RecipeName: { type: String, required: true }, // Name of the recipe
  TranslatedRecipeName: { type: String }, // Translated name of the recipe
  Ingredients: { type: String, required: true }, // Ingredients as a string
  TranslatedIngredients: { type: String }, // Translated ingredients
  PrepTimeInMins: { type: Number, required: true }, // Preparation time in minutes
  CookTimeInMins: { type: Number, required: true }, // Cooking time in minutes
  TotalTimeInMins: { type: Number, required: true }, // Total time (prep + cook) in minutes
  Servings: { type: String, required: true }, // Number of servings
  Cuisine: { type: String }, // Cuisine type (e.g., Indian, Italian)
  Course: { type: String }, // Course type (e.g., Appetizer, Main Course)
  Diet: { type: String }, // Diet type (e.g., Vegetarian, Vegan)
  Instructions: { type: String, required: true }, // Cooking instructions
  TranslatedInstructions: { type: String }, // Translated cooking instructions
  URL: { type: String }, // URL for the recipe (optional)
});

// Create the model
const Recipe = mongoose.model("Recipe", recipeSchema, "recipe");

module.exports = Recipe;
