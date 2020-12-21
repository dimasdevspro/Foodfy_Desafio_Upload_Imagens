const Recipe = require("../models/Recipe");
const Chef = require("../models/Chef");
const File = require("../models/File");
const RecipeFile = require('../models/RecipeFile');

module.exports = {
  async home(req, res) {
    try {
      let results1 = await Recipe.all();
      const recipes = results1.rows;

    // let results2 = await Recipe.filesAll();
    // const files = results2.rows.map((file) => ({
    //   ...file,
    //   src: `${req.protocol}://${req.headers.host}${file.path.replace(
    //     "public",
    //     ""
    //   )}`,
    // }));
    async function getImage(recipeId){
      const results2 = await RecipeFile.find(recipeId);
      const files = results2.rows.map(file => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
      }));

      return files[0]
    }

    let results3 = await Chef.all()
    const chefs = results3.rows

    
    const filesPromise = await results1.rows.map(recipe => getImage(recipe.id));
    const recipeFiles = await Promise.all(filesPromise);
    return res.render("home", { recipes, recipeFiles, chefs })
    // console.log({recipes, recipeFiles, chefs})
    }catch (err){
      throw new Error(err);
    }
    
  },
  about(req, res) {
    return res.render("about");
  },
  async index(req, res) { 
    try {
      let { filter, page, limit } = req.query;

      page = page || 1;
      limit = limit || 6;
      let offset = limit * (page - 1);

      let results = await Recipe.all();
      const recipes = results.rows;

      async function getImage(recipeId){
        const results2 = await RecipeFile.find(recipeId);
        const files = results2.rows.map(file => ({
          ...file,
          src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
        }));
  
        return files[0]
      }
  
      const filesPromise = await results.rows.map(recipe => getImage(recipe.id));
      const recipeFiles = await Promise.all(filesPromise);

      // (err, results) => {
      //   if (err) throw `Database Error! ${err}` 
      //   callback(results.rows)}

      const params = {
        filter,
        page,
        limit,
        offset,
        callback(recipes) {
          const pagination = {
            total: Math.ceil(recipes[0].total / limit),
            page,
          };
            // return res.render("recipes/recipes", { recipeFiles, recipes, pagination, filter });
            console.log(recipes, pagination, filter, recipeFiles)
        
        }
      }
        
      Recipe.paginate(params);
    }catch(error){
       throw new Error(error)
    }
    
},
  create(req, res) {
    Recipe.chefsSelectOptions()
      .then(function (results) {
        const chefOptions = results.rows;
        return res.render("recipes/create", { chefOptions });
      })
      .catch(function (err) {
        throw new Error(err);
      });
  },
  async post(req, res) {
    try {
      const keys = Object.keys(req.body);

      for (key of keys) {
        if (req.body[key] == "") {
          return res.send("Please, fill all fields!");
        }
      }
  
      if (req.files.length == 0) {
        return res.send("Please, send at least one image");
      }
  
      let results = await Recipe.create(req.body);
      const recipeId = results.rows[0].id;
      
      // results = await File.create(req.body)
      // const fileId = results.rows[0].id;
      
      const filesPromise = req.files.map((file) => File.create({ ...file}),
        // File.create2({...file, files_id: fileId, recipes_id: recipeId})
      );
      results = await Promise.all(filesPromise);
  
      const recipeFiles = results.map(result => result.rows[0])
      const recipeFilesPromise = recipeFiles.map(file => RecipeFile.create(file.id, recipeId));
      results = await Promise.all(recipeFilesPromise);
  
      return res.redirect(`/admin/recipes/recipes/${recipeId}/edit`);
      // console.log(recipeId)
    } catch(err){
      throw new Error(err);
    }
  },
  async show(req, res) {
    const recipeId = req.params.id
    let results = await Recipe.find(req.params.id);
    const recipe = results.rows[0];

    if (!recipe) return res.send("Recipes not found!");

    results = await RecipeFile.findByRecipeId(recipeId);
    const recipeFilesPromise = results.rows.map(file => File.find(file.file_id));
    results = await Promise.all(recipeFilesPromise);

    let recipeFiles = results.map(result => result.rows[0]);
    recipeFiles = recipeFiles.map(file => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
    }));
    // return res.render("recipes/show", { recipe, recipeFiles });
    console.log({recipe, recipeFiles})
  },
  async edit(req, res) {
    try {
      const recipeId = req.params.id;

      let results = await Recipe.find(recipeId);
      const recipe = results.rows[0];

      if (!recipe) return res.send("Recipes not found!");

      results = await Recipe.chefsSelectOptions();
      const chefOptions = results.rows;

      // results = await Recipe.files(recipe.id);
      // let files = results.rows;
      // files = files.map((file) => ({
      //   ...file,
      //   src: `${req.protocol}://${req.headers.host}${file.path.replace(
      //     "public",
      //     ""
      //   )}`,
      // }));

      async function getImage(recipeId){
        const results = await RecipeFile.find(recipeId);
        const files = results.rows.map(file => ({
          ...file,
          src: `${req.protocol}://${req.headers.host}${file.path.replace('public', '')}`
        }));
  
        return files
      }
  
      const filesPromise = await getImage(recipeId);
      const recipeFiles = await Promise.all(filesPromise);

      return res.render("recipes/edit", {
        recipe,
        chefOptions,
        recipeFiles,
      });
      // console.log({recipe, chefOptions, recipeFiles})
    } catch (error) {
      throw new Error(error);
    }
  },
  async put(req, res) {
    try {
      const keys = Object.keys(req.body)
      const recipeId = req.body.id

      for (key of keys) {
        if (req.body[key] == "" && key != "removed_files") {
          return res.send("Please, fill all fields!")
        }
      }

      if (req.body.removed_files) {
        const removedFiles = req.body.removed_files.split(",")
        const lastIndex = removedFiles.length - 1
        removedFiles.splice(lastIndex, 1)

        const removedFilesPromise = removedFiles.map(id => File.delete(id))

        await Promise.all(removedFilesPromise)
      }

      if(req.files.length != 0) {
        const newFilesPromise = req.files.map(file => File.create({...file}))
        const result = await Promise.all(newFilesPromise);

        const recipeFiles = result.map(result => result.rows[0]);
        const recipeFilesPromise = recipeFiles.map((file) => Recipe.create(file.id, recipeId))
        await Promise.all(recipeFilesPromise)
      }
      await Recipe.update(req.body)

      return res.redirect(`/admin/recipes/recipes/${recipeId}`)
      // console.log(req.body);
    } catch (error) {
      throw new Error(error)
    }
  },
  async delete(req, res) {
    await Recipe.delete(req.body.id);

    // return res.redirect(`/admin/recipes/recipes`);
    console.log(req.body.id)
  },
};
