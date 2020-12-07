const Chef = require("../models/Chef");

module.exports = {
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
      callback(chefs) {

        const pagination = {
          total: Math.ceil(chefs[0].total / limit),
          page
        }
        return res.render("chefs/chefs", { chefs, pagination, filter })
      }
     
    }
    Chef.paginate(params)

  },
  create(req, res) {
    return res.render("chefs/create");
  },
  post(req, res) {
    Chef.create(req.body, function (chef) {
      return res.redirect(`/admin/chefs/chefs/${chef.id}`);
    });
  },
  show(req, res) {
    Chef.find(req.params.id, function (chef) {
      if (!chef) return res.send("Chefs not found!");
      Chef.findRecipes(req.params.id, function (recipes) {
        if (!recipes)
          return res.send(
            "Chef preparing... at soon we publish chef's recipe. ;)"
          );
        return res.render("chefs/show", { chef, recipes });
        // console.log({chef, recipes})
      });
    });
  },
  edit(req, res) {
    Chef.find(req.params.id, function (chef) {
      if (!chef) return res.send("Chefs not found!");

      return res.render("chefs/edit", {chef});
      // console.log(chef)
    });
  },
  put(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == "") return res.send("Please, fill all fields");
    }

    Chef.update(req.body, function() {
      return res.redirect(`/admin/chefs/chefs/${req.body.id}`);
      // console.log(req.body)
    });
  },
  delete(req, res) {
    Chef.delete(req.body.id, function () {
      return res.redirect(`/admin/chefs/chefs`);
    });
  },
};
