const db = require('mysql')
require('dotenv').config()
const config = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    dateStrings: 'date'
}
const pool = db.createPool(config)
module.exports = (function () {
    return {
        init: function () {
            pool.getConnection(function (err, con) {
                if (err) {
                    console.log("MariaDB Connection Error " + err)
                    throw err;
                }
                console.log("MariaDB Database Connected!");
                let sqlQuery;

                sqlQuery = "CREATE TABLE `FILE_TB` ( `ID` INT NOT NULL AUTO_INCREMENT COMMENT 'Unique Id' , " +
                    "`PATH` VARCHAR(80) NOT NULL COMMENT '파일 경로' ," +
                    "`OBJ` LONGBLOB NULL COMMENT '파일 바이너리' ," +
                    "`REG_DATE` DATE NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '시간'" +
                    ", PRIMARY KEY (`ID`));"

                con.query(sqlQuery, function (err, result) {
                    if (err) {
                        console.log("Create File Table Error " + err);
                    } else {
                        console.log("FILE_TB Table Created");
                    }
                })

                con.release()
                setInterval(keepAlive, 60 * 60 * 1000);
            })
        },

        /**
         * Query 문 처리하는 함수.
         * 파라미터가 존재하는 타입.
         * @param {String} query    DB Query
         * @param {String []} params  Parameter ex.) '?'
         * @param {bool,rows} callback  Query Callbakc Listener
         */
        query: function (query, params, callback) {
            if (params == null) {
                pool.getConnection(function (err, con) {
                    if (err) {
                        callback(err, "DataBase Connection Error")
                        con.release()
                    } else {
                        con.query(query, function (err, rows) {
                            callback(err, rows)
                            // Pool에 Connection을 반납 
                            con.release();
                        })
                    }
                })
            } else {
                pool.getConnection(function (err, con) {
                    if (err) {
                        callback(err, "DataBase Connection Error")
                        con.release();
                    } else {
                        con.query(query, params, function (err, rows) {
                            callback(err, rows);
                            // Pool에 Connection을 반납 
                            con.release();
                        })
                    }
                })
            }
        }
    }
})()

// Mysql 특성상 8시간 지나면 자동으로 연결을 해제하는 이슈가 있음.
// 한시간 단위로 연결을 유지하도록 하는 함수.
function keepAlive() {
    pool.getConnection(function (err, con) {
        if (err) { return; }
        console.log('Ping!!');
        con.ping();
        // Pool에 Connection을 반납 
        con.release();
    });
    // redis client 사용중이라면 여기서 client.ping(); 하여 연결을 유지한다.
}