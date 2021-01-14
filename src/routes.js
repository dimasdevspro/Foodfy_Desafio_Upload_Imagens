const express = require('express')
const routes = express.Router()
const recipes = require('./app/controllers/recipes')
const chefs = require('./app/controllers/chefs')
const multer = require('./app/middlewares/multer')
//VIEWS

routes.get("/", recipes.home);
routes.get("/about", recipes.about)

//ADMIN RECIPES


routes.get("/recipes", recipes.index); // Mostrar a lista de receitas
routes.get("/recipes/create", recipes.create); // Mostrar formulário de nova receita
routes.post("/recipes", multer.array("photos", 5), recipes.post); // Cadastrar nova receita
routes.get("/recipes/:id", recipes.show); // Exibir detalhes de uma receita
routes.get("/recipes/:id/edit", recipes.edit); // Mostrar formulário de edição de receita
routes.put("/recipes", multer.array("photos", 5), recipes.put); // Editar uma receita
routes.delete("/recipes", recipes.delete); // Deletar uma receita

//ADMIN CHEFS
 

routes.get("/chefs", chefs.index); // Mostrar a lista de chef
routes.get("/chefs/create", chefs.create); // Mostrar formulário de novo chef
routes.get("/chefs/:id", chefs.show); // Exibir detalhes de um chef
routes.get("/chefs/:id/edit", chefs.edit); // Mostrar formulário de edição de um chef

routes.post("/chefs", multer.array("photos", 1), chefs.post); // Cadastrar novo chef
routes.put("/chefs", multer.array("photos", 1), chefs.put); // Editar um chef
routes.delete("/chefs", chefs.delete); // Deletar um chef

module.exports = routes