const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const model = require('../models/uploadModel')
const utils = require('../utils/commandUtil')

/**
 * 파일 필터링
 * @param {Http Request}}} req 
 * @param {File Struct} file 
 * @param {File Listener} callback 
 */
const filter = (req, file, callback) => {
    console.log('Filter File 타입' + file.mimetype)
    const type = file.mimetype
    if (type.startsWith('image') ||
        type.startsWith('video') ||
        type.startsWith('text') ||
        type.startsWith('application')) {
        callback(null, true);
    } else {
        callback('Uploadable files are img, video, text, and application.', false);
    }
}

/**
 * 현재 날짜 기준 디렉토리 생성 처리 함수
 * 있으면 바로 리턴
 * @param {File Directory Path} path 
 * @param {File Listener} callback 
 */
const dateDir = (path, callback) => {
    utils.checkDir(fs, path, function (isSuccess, msg) {
        console.log("SUCC " + isSuccess + " DIR Path " + msg)
        if (isSuccess) {
            callback(null, path)
        }
    })
}

const storage = multer.diskStorage({
    // 폴더 경로 설정
    destination: function (req, file, callback) {
        console.log('File 타입' + file.mimetype)
        const currDate = utils.getCurrentDate()
        const type = file.mimetype
        if (type.startsWith('image')) {
            dateDir(process.env.UPLOAD_IMG + '/' + currDate, callback)
        } else if (type.startsWith('video')) {
            dateDir(process.env.UPLOAD_VIDEO + '/' + currDate, callback)
        } else if (type.startsWith('text')) {
            dateDir(process.env.UPLOAD_TXT + '/' + currDate, callback)
        } else {
            // 이외 케이스
            dateDir(process.env.UPLOAD_ETC + '/' + currDate, callback)
        }
    },
    // 파일명 설정
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        const ranDomName = Math.random().toString(36).substr(2, 11);
        console.log("FileName " + file.originalname)
        // ${현재 시간 TimeMilles}${랜덤 이름}.${확장자 포멧}
        callback(null, Date.now() + ranDomName + extension);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: filter
})

// [s] API Start
router.post('/api/uploads', upload.array('files'), (req, res) => {
    try {
        let filePathList = new Array()
        const fileSize = req.files.length
        let callBackCnt = 0
        req.files.forEach(e => {
            model.addFile(e.path, function onMessage(err, rows) {
                callBackCnt++
                // Sql Error
                if (err) {
                    console.log("DB Error " + err)
                } else {
                    // Sql Success
                    console.log("DB Success " + rows)
                    filePathList.push({
                        id: rows.insertId,
                        path: e.path
                    })
                }

                // 모든 CallBack 완료 했다면.
                if (callBackCnt == fileSize) {
                    console.log(filePathList)
                    res.status(200).send({
                        status: true,
                        pathList: filePathList
                    }).end()
                }
            })
        })
    } catch (err) {
        console.log('Add File Error ' + err)
        res.status(416).send({
            status: false,
            errMsg: err
        }).end()
    }
})

router.delete('/api/uploads', (req, res) => {
    try {
        let deleteIds
        if (Array.isArray(req.query.deleteIds)) {
            deleteIds = req.query.deleteIds
        } else {
            deleteIds = new Array(req.query.deleteIds)
        }

        // DB Query 실행 기준은 File Id 리스트 기준.
        const callBackLength = deleteIds.length
        let callBackCnt = 0
        for (let i = 0; i < callBackLength; i++) {
            model.deleteFile(deleteIds[i], function onMessage(err, rows,imgPath) {
                callBackCnt++
                // Sql Error 
                if (err) {
                    console.log('Sql Error')
                    console.log(err)
                }

                try {
                    console.log('Delete Path ' + imgPath)
                    fs.unlinkSync(imgPath)
                } catch (err) {
                    console.log('File Delete Error')
                    console.log(err)
                }

                // 모든 CallBack 완료 했다면.
                if (callBackCnt == callBackLength) {
                    res.status(200).send({
                        status: true,
                        msg: '파일이 정상적으로 삭제 되었습니다.'
                    }).end()
                }
            })
        }
    } catch (err) {
        console.log('Delete File Error ' + err)
        res.status(416).send({
            status: false,
            errMsg: err
        }).end()
    }
})
// [e] API End

module.exports = router