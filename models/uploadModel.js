const db = require('../db/db_config')
const StringBuffer = require('stringbuffer');

const upload = {
    addFile: function (filePath, callback) {
        const query = 'INSERT INTO FILE_TB (PATH) VALUES (?)'
        const params = [filePath]
        db.query(query, params, callback)
    },
    deleteFile: function (fileId, callback) {
        let query = 'SELECT PATH FROM FILE_TB WHERE ID=?'
        let params = [fileId]
        let imgPath = ''
        db.query(query, params, function (selectErr, selectRows) {
            try {
                if (selectErr) {
                    callback(selectErr, selectRows, null)
                } else {
                    imgPath = selectRows[0].PATH
                    query = 'DELETE FROM FILE_TB WHERE ID=?'
                    db.query(query, params, function (err, rows) {
                        callback(err, rows, imgPath)
                    })
                }
            } catch (err) {
                callback(err,null,null)
            }
        })
    }
}

module.exports = upload