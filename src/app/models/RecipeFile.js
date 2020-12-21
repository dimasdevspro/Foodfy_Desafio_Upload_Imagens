const db = require('../../config/db');

module.exports = {
  create(fileId, recipeId){
    try {
      const query = `
        INSERT INTO recipes_files (
          recipes_id,
          files_id
        ) VALUES($1, $2)
        RETURNING id`;

      const values = [
        recipeId,
        fileId
      ];

      return db.query(query, values);
      // console.log(query, values)
    } catch (error) {
      throw new Error(error)
    }
  },
  all() {
    try {
      return db.query(`
        SELECT files.*, recipes_files.recipe_id AS recipe_id
        FROM recipe_files
        LEFT JOIN files ON (recipes_files.file_id = files.id)
        GROUP BY files.id, recipes_files.recipe_id
        ORDER BY files.id
      `)
    } catch (err) {
      throw new Error(err);
    }
  },
  findByRecipeId(id){
    try {
      return db.query(`
        SELECT *
        FROM recipes_files
        WHERE recipes_files.recipes_id = $1
        ORDER BY recipes_files.files_id`,
        [id]
      );
    } catch (error) {
      throw new Error(error);
    }
  },
  find(id){
    return db.query(`
      SELECT recipes_files.*, files.path AS path, files.name AS name
      FROM recipes_files
      LEFT JOIN files ON (recipes_files.files_id = files.id)
      WHERE recipes_files.recipes_id = $1
      ORDER BY recipes_files.recipes_id`,
      [id]
    );
  },
  findByFileId(id){
    try {
      return db.query(`
        SELECT * 
        FROM recipes_files
        WHERE recipes_files.file_id = $1
        ORDER BY recipes_files.file_id`,
        [id]
      );
    } catch (error) {
      throw new Error(error);
    }
  },
  delete(id){
    try {
      return db.query(`DELETE FROM recipes_files WHERE file_id = $1`, [id]);
    } catch (error) {
      throw new Error(error);
    }
  }
}