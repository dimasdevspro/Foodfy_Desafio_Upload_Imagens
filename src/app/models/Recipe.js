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
    create(data, callback) {

        const keys = Object.keys(data)

        for(key of keys) {
            if(data[key] == "")
         return res.alert('Please, fill all fields')
        }
    const query = `
        INSERT INTO recipes (
            image,
            title,
            ingredients,
            preparations,
            informations,
            created_at,
            chef_id
        ) VALUES ( $1, $2, $3, $4, $5, $6, $7)
        RETURNING id
    `
    const values = [
        data.image,
        data.title,
        data.ingredients,
        data.preparations,
        data.informations,
        date(Date.now()).iso,
        data.chef
    ]

    db.query(query, values, function(err, results){
        if(err) throw `Database Error! ${err}`

         callback(results.rows[0])
        })
    },
    find(id, callback) {
        db.query(`
        SELECT recipes.*, chefs.name AS author 
        FROM recipes 
        LEFT JOIN chefs ON (chefs.id = recipes.chef_id)
        WHERE recipes.id = $1`, [id], function(err, results){
            if(err)  throw `Database Error! ${err}`
            callback(results.rows[0])
        })
    },
    update(data, callback) {
        const query = `
        UPDATE recipes SET
        image=($1),
        title=($2),
        ingredients=ARRAY[$3],
        preparations=ARRAY[$4],
        informations=($5),
        chef_id=($6)
        WHERE id= $7
        `

        const values = [
            data.image,
            data.title,
            data.ingredients,
            data.preparations,
            data.informations,
            data.chef,
            data.id
        ]

        db.query(query, values, function(err, results){
            if(err)  throw `Database Error! ${err}`

            callback()
        })
    },
    delete(id, callback) {
        db.query(`DELETE FROM recipes WHERE id = $1`, [id], function(err, results){
            if(err)  throw `Database Error! ${err}`

            return callback()
        })
    },
    chefsSelectOptions(callback) {
        db.query(`SELECT name, id FROM chefs`, function(err, results){
            if (err) throw 'Database Error!'

            callback(results.rows)
        })
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
        SELECT recipes.image, recipes.title, recipes.id AS recipe_id, chefs.name AS author, ${totalQuery} 
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
    }
}
