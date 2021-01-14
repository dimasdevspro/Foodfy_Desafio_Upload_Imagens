const Chef = require("../models/Chef");
const File = require('../models/File')
module.exports = {
  async index(req, res) {
    // desconstruindo a query
    let { filter, page, limit } = req.query
    // definindo as propriedades da página
    page = page || 1
    limit = limit || 6
    let offset = limit * (page - 1)
    filter = filter || ''
    //definindo os requisitos de busca no bd e retornando a renderização
    const params = {
      filter,
      page,
      limit, 
      offset,
      callback: function(chefs) {

        const pagination = {
          total: Math.ceil(chefs[0].total / limit),
          page,
        }
          for (i = 0; chefs.length > i; i++) {
            chefs[i].path = `${req.protocol}://${req.headers.host}${chefs[i].path.replace("public", "")}`
          }
          // console.log(chefs, pagination, filter)
        return res.render("admin/chefs/index", { chefs, pagination, filter})
        }  
      }
    await Chef.paginate(params)

  },
  async create(req, res) {
    return res.render("admin/chefs/create");
  },
  async post(req, res) {
    //validando e todos os campos estão preenchidos
    const keys = Object.keys(req.body)
    for (key of keys) {
    
      if(req.body[key] == "") {
      res.send("Please, fill all fields!")
    }
  }
    // validando se ao menos uma imagem será enviada
    if (req.files.length == 0) res.send("Please, send at least one image!")
     
    //gravando os dados no deb, na tabela - files, e alocando id

    let results = await File.create(req.files[0])
    const fileId = results.rows[0].id
   

    //gravando os dados no db, na tabela - chefs
    results = await Chef.create(req.body);
    const chefId = results.rows[0].id

    return res.redirect(`/chefs/${chefId}`)
  
},
  async show(req, res) {
     //buscando as informações de chefs
     let results = await Chef.find(req.params.id);
     const chef = results.rows[0];
 
     // validando informação
     if (!chef) return res.send("Chef Not Found!");
     
     // buscando as informações de receitas
     results = await Chef.findRecipes(req.params.id)
     const recipe = results.rows[0];

     //buscando as informações das imagens
     results = await File.find2(chef.id);
 
     //validando se há imagens em arquivo
     if (results.rows) {
       const dataFile = results.rows.map((file) => ({
         ...file,
         src: `${req.protocol}://${req.headers.host}${file.path.replace(
           "public",
           ""
         )}`,
       }));

       return res.render("admin/chefs/show", { chef, recipe, dataFile });
     } else {
       const dataFile = {};
 
       return res.render("admin/recipes/show", { recipe, dataFile });
     }
  },
  async edit(req, res) {
   //buscando as informações chefs
   let results = await Chef.find(req.params.id);
   const chef = results.rows[0];

   // validando se há chefs
   if (!chef) res.send("Recipes not found!");

   //buscando os dados da imagens
   results = await File.find(chef.id);

   //validando se há imagens em arquivo
   if (results.rows[0]) {
     const dataFile = results.rows.map((files) => ({
       ...files,
       src: `${req.protocol}://${req.headers.host}${files.path.replace(
         "public",
         ""
       )}`,
     }));
     console.log(dataFile, chef);
     //renderizando a página e enviando os objetos para edição
    //  return res.render(`admin/recipes/edit`, {
    //    chef,
    //    dataFile,
    //  });
   } else {
     const dataFile = {};
    //  console.log(dataFile, chef);
    //  renderizando a página e enviando os objetos para edição
     return res.render(`admin/recipes/edit`, {
       chef,
       dataFile,
     });
   }
  },
  put(req, res) {
    const keys = Object.keys(req.body);

    for (key of keys) {
      if (req.body[key] == "") return res.send("Please, fill all fields");
    }

    Chef.update(req.body, function() {
      return res.redirect(`chefs/${req.body.id}`);
      // console.log(req.body)
    });
  },
  delete(req, res) {
    Chef.delete(req.body.id, function () {
      return res.redirect(`/chefs`);
    });
  },
};
