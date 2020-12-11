const db = require('../../config/db')
const { date } = require('../../lib/utils')

module.exports = {
    all(callback) {
        db.query(`SELECT * 
        FROM recipes
        ORDER BY title ASC`, function(err, results){
            if(err)  throw `Database Error! ${err}`
            
            callback(results.rows)
        })

    },
    create(data) {

        const keys = Object.keys(data)

        for(key of keys) {
            if(data[key] == "")
         return res.send('Please, fill all fields')
        }
    const query = `
        INSERT INTO recipes (
            title,
            ingredients,
            preparations,
            informations,
            created_at,
            chef_id
        ) VALUES ( $1, $2, $3, $4, $5, $6)
        RETURNING id
    `
    const values = [
        data.title,
        data.ingredients,
        data.preparations,
        data.informations,
        date(Date.now()).iso,
        data.chef,
    ]
    return db.query(query, values)
    },
    find(id) {
        return db.query(`
        SELECT recipes.*, chefs.name AS author 
        FROM recipes 
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        WHERE recipes.id = $1`, [id])
    },
    update(data) {
        const query = `
        UPDATE recipes SET
        title=($1),
        ingredients=ARRAY[$2],
        preparations=ARRAY[$3],
        informations=($4),
        chef_id=($5)
        WHERE id= $6
        `

        const values = [
            data.title,
            data.ingredients,
            data.preparations,
            data.informations,
            data.chef,
            data.id
        ]

        return db.query(query, values)
    },
    delete(id) {
        return db.query(`DELETE FROM recipes WHERE id = $1`, [id])
    },
    chefsSelectOptions() {
         return db.query(`
         SELECT name, id FROM chefs`
         )
    },
    paginate(params) {
        const { filter, limit, offset, callback } = params

        let query = "",
        filterQuery = "",
        totalQuery = `(
            SELECT count(*) FROM recipes
        ) AS total`


        if (filter ){

            filterQuery = `
            WHERE recipes.title ILIKE '%${filter}%'
            OR chefs.name ILIKE '%${filter}%'
            `

            totalQuery = `(
                SELECT count(*) FROM recipes
                ${filterQuery}
            ) AS total`
        }

        query =`
        SELECT recipes.title, recipes.id AS recipe_id, chefs.name AS author, ${totalQuery} 
        FROM recipes
        ${filterQuery}
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        ORDER BY recipes.title
        LIMIT $1 OFFSET $2
        `

        db.query(query, [limit, offset], function(err, results){
            if (err) throw `Database Error! ${err}` 
            callback(results.rows)
            // console.log(results.rows)
        })
    },
    files(id){
        return db.query(`
        
        SELECT * FROM recipes_files WHERE recipes_id = $1
        `, [id])
    }
}
