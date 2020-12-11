const { date } = require("../../lib/utils");

const Recipe = require("../models/Recipe");
const Chef = require("../models/Chef");
const File = require("../models/File");

module.exports = {
  home(req, res) {
    Recipe.all(function (recipes) {
      Chef.all(function (chefs) {
        return res.render("home", { chefs, recipes });
      });
    });
  },
  about(req, res) {
    return res.render("about");
  },
  index(req, res) {
    let { filter, page, limit } = req.query;

    page = page || 1;
    limit = limit || 6;
    let offset = limit * (page - 1);

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
        return res.render("recipes/recipes", { recipes, pagination, filter });
        // console.log(recipes, pagination, filter)
      },
    };
    Recipe.paginate(params);
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

    const filesPromise = req.files.map((file) =>
      File.create({ ...file, recipes_id: recipeId })
    );
    await Promise.all(filesPromise);

    return res.redirect(`/admin/recipes/recipes/${recipeId}/edit`);
    // console.log(req.body)
  },
  async show(req, res) {
    let results = await Recipe.find(req.params.id);
    const recipe = results.rows[0];

    if (!recipe) return res.send("Recipes not found!");

    results = await Recipe.files(recipe.id);
    const files = results.rows.map((file) => ({
      ...file,
      src: `${req.protocol}://${req.headers.host}${file.path.replace(
        "public",
        ""
      )}`,
    }));
    return res.render("recipes/show", { recipe, files });
  },
  async edit(req, res) {
    try {
      let results = await Recipe.find(req.params.id);
      const recipe = results.rows[0];

      if (!recipe) return res.send("Recipes not found!");

      results = await Recipe.chefsSelectOptions();
      const options = results.rows;

      results = await Recipe.files(recipe.id);
      let files = results.rows;
      files = files.map((file) => ({
        ...file,
        src: `${req.protocol}://${req.headers.host}${file.path.replace(
          "public",
          ""
        )}`,
      }));
      return res.render("recipes/edit", {
        recipe,
        chefOptions: options,
        files,
      });
      // console.log({recipe, chefOptions: options, files})
    } catch (error) {
      throw new Error(error);
    }
  },
  async put(req, res) {
    try {
      const keys = Object.keys(req.body)

      for (key of keys) {
        if (req.body[key] == "" && key != "removed_files") {
          return res.send("Please, fill all fields!")
        }
      }
      
      if(req.files.length != 0) {
        const newFilesPromise = req.files.map(file => File.create({...file, recipe_id: req.body.id}))

        await Promise.all(newFilesPromise)
      }

      if (req.body.removed_files) {
        const removedFiles = req.body.removed_files.split(",")
        const lastIndex = removedFiles.length - 1
        removedFiles.splice(lastIndex, 1)

        const removedFilesPromise = removedFiles.map(id => File.delete(id))

        await Promise.all(removedFilesPromise)
      }

      await Recipe.update(req.body)

      return res.redirect(`/admin/recipes/recipes/${req.body.id}`)
      // console.log(req.body);
    } catch (error) {
      throw new Error(error)
    }
  },
  async delete(req, res) {
    await Recipe.delete(req.body.id);

    return res.redirect(`/admin/recipes/recipes`);
  },
};
