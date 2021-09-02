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
    } catch(err) {
        return callback(err)
    }

}

exports.checkDir = function (fs, path, callback) {
    isDir(fs, path, (err, isTrue) => {
        if (err) {
            if(callback == null){
                return console.log(err);
            } else {
                return callback(false, '에러!' + err);
            }
        }

        if (!isTrue) {
            if(callback == null){
                return console.log('이미 동일한 디렉토리가 있습니다. ' + path);
            } else {
                return callback(true, '이미 동일한 디렉토리가 있습니다.' + path);
            }
        }

        fs.mkdir(path, (err) => {
            if (err) {
                if(callback == null){
                    return console.log(err);
                } else {
                    return callback(false, err);
                }
            }

            // 디렉토리 생성 완료.
            if(callback == null){
                return console.log('디렉토리 생성 완료 ' + path);
            } else {
                return callback(true, path);
            }
        })
    })
}