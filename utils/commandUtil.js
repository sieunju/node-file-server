const e = require('express');
const authModel = require('../models/authModel')

/**
 * 디렉토리 체크 로직
 * @param {string} path 
 * @param {function} callback 
 */
const isDir = (fs, path, callback) => {
    try {
        fs.stat(path, (err, stats) => {
            if (err && err.code === 'ENOENT')
                return callback(null, true);
            if (err)
                return callback(err);

            return callback(null, !stats.isDirectory());
        });
    } catch (err) {
        return callback(err)
    }

}

exports.checkDir = function (fs, path, callback) {
    isDir(fs, path, (err, isTrue) => {
        if (err) {
            if (callback == null) {
                return console.log(err);
            } else {
                return callback(false, '에러!' + err);
            }
        }

        if (!isTrue) {
            if (callback == null) {
                return console.log('이미 동일한 디렉토리가 있습니다. ' + path);
            } else {
                return callback(true, '이미 동일한 디렉토리가 있습니다.' + path);
            }
        }

        fs.mkdir(path, (err) => {
            if (err) {
                if (callback == null) {
                    return console.log(err);
                } else {
                    return callback(false, err);
                }
            }

            // 디렉토리 생성 완료.
            if (callback == null) {
                return console.log('디렉토리 생성 완료 ' + path);
            } else {
                return callback(true, path);
            }
        })
    })
}

exports.getCurrentDate = function () {
    const date = new Date()
    const year = date.getFullYear().toString()
    let month = date.getMonth() + 1
    month = month < 10 ? '0' + month.toString() : month.toString()
    let day = date.getDate()
    day = day < 10 ? '0' + day.toString() : day.toString()
    return year + '' + month + '' + day
}

exports.checkAuth = function (findAuthKey,callback) {
    authModel.fetchAutkKey(function onMessage(err,rows) {
        if(err) {
            callback(false)
            return
        }
        console.log(findAuthKey)
        rows.forEach(e => {
            if(e.AUTH_KEY == findAuthKey) {
                callback(true)
                return
            }
        });
        callback(false)
    })
}