const db = require('../../config/db')
const fb = require('fs')

module.exports = {
    create({filename, path}) {

        const query = `
        INSERT INTO files (
            name,
            path
        ) VALUES ( $1, $2 )
        RETURNING id
        `
        const values = [
            filename,
            path
                ]
        return db.query(query, values)
        // console.log(query, values)
    },
    find(id) {
        try {
            return db.query(`SELECT * FROM files WHERE id = $1`, [id])
        }catch(err){
            throw new Error(err);
        }
    },
    async delete(id) {

        try{
            const results = await db.query(`SELECT * FROM files WHERE id =$1`, [id])
            const file = results.rows[0]

            fb.unlikSync(file.path
                )
        }catch(err){
            console.error(err)
        }
        return db.query(`
        DELETE FROM files WHERE id = $1
        `)
    }
}