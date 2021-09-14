const db = require('../db/db_config')

const auth = {
    fetchAutkKey: function (callback) {
        const query = 'SELECT AUTH_KEY FROM AUTH_TB'
        db.query(query, null, callback)
    }
}

module.exports = auth