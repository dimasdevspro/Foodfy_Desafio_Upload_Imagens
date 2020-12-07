const { date } = require('../../lib/utils')

const Recipe = require('../models/Recipe')
const Chef = require('../models/Chef')

module.exports = {
    home(req, res){
        Recipe.all(function(recipes){
            Chef.all(function(chefs){
                 return res.render("home", {chefs, recipes})
            })
           
        })
    
    },
    about(req, res){
        return res.render("about")
    },
    index(req, res) {
        let { filter, page, limit } = req.query
    
        page = page || 1
        limit = limit || 6
        let offset = limit *(page - 1)
    
        const params = {
          filter,
          page,
          limit, 
          offset,
          callback(recipes) {
    
            const pagination = {
              total: Math.ceil(recipes[0].total / limit),
              page
            }
            return res.render("recipes/recipes", {recipes, pagination, filter })
            // console.log(recipes, pagination, filter)
          }
         
        }
        Recipe.paginate(params)
    
      },
    create(req, res){
        Recipe.chefsSelectOptions(function(options){
             return res.render("recipes/create", {chefOptions: options} )
            // console.log({chefOptions: options})
        })

       
    },
    post(req, res){
        Recipe.create(req.body, function(recipe){
            return res.redirect(`/admin/recipes/recipes/${recipe.id}`)
        })
    },
    show(req, res){
        Recipe.find(req.params.id, function(recipe){
            if(!recipe) return res.send("Recipes not found!")
            
            return res.render("recipes/show", {recipe})
        })      
    },
    edit(req, res){
        Recipe.find(req.params.id, function(recipe){
            if(!recipe) return res.send("Recipes not found!")
            
            Recipe.chefsSelectOptions(function(options){
                return res.render("recipes/edit", {recipe, chefOptions: options})      
    })
    })        
    },
    put(req, res){
        const keys = Object.keys(req.body)
    for(key of keys) {
        if(req.body[key] == "")
        return res.send('Please, fill all fields')
    }

    Recipe.update(req.body, function(){
        // return res.redirect(`/admin/recipes/recipes/${req.body.id}`)
        console.log(req.body)
    })
    },
    delete(req, res){
        Recipe.delete(req.body.id, function(){
            return res.redirect(`/admin/recipes/recipes`)
        })
    },
}
