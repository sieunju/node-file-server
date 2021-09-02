const db = require('../db/db_config')
const StringBuffer = require('stringbuffer');

const upload = {
    addFile: function (filePath,callback) {
        const query = 'INSERT INTO FILE_TB (PATH) VALUES (?)'
        const params = [filePath]
        db.query(query,params,callback)
    },
    deleteFile: function(fileId,callback) {
        const query = 'DELETE FROM FILE_TB WHERE (ID=?)'
        const params = [fileId]
        db.query(query,params,callback)
    },
    deleteFiles: function(fileIds,callback) {
        const queryBuf = new StringBuffer()
        const paramsArr = new Array()
        queryBuf.append('DELETE FROM FILE_TB WHERE ')
        for(let i = 0; i<fileIds.length; i++) {
            queryBuf.append('(ID=?)')
            paramsArr.push(fileIds[i])

            if (i != fileIds.length - 1) {
                queryBuf.append(' OR ')
            }
        }
        db.query(query,params,callback)
    }
}

module.exports = upload