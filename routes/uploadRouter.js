const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const model = require('../models/uploadModel')


const filter = (req, file, callback) => {

    if (file.mimetype.startsWith('image')) {
        callback(null, true);
    } else {
        console.log("이미지 파일이 아닙니다.!");
        callback('Plz upload Only Images.', false);
    }
}

const storage = multer.diskStorage({
    // 서버에 저장할 폴더 생성.
    destination: function (req, file, callback) {
        console.log('File 타입' + file.mimetype)
        if (file.mimetype.startsWith('image')) {
            callback(null, process.env.UPLOAD_IMG);
        } else if (file.mimetype.startsWith('video')) {
            callback(null, process.env.UPLOAD_VIDEO)
        } else {
            console.log('잘못된 파일 타입입니다.!');
        }
    },
    // 서버에 저장할 파일명
    filename: function (req, file, callback) {
        let extension = path.extname(file.originalname);
        const ranDomName = Math.random().toString(36).substr(2, 11);
        callback(null, 'FILE_' + Date.now() + ranDomName + extension);
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
        console.log("여길 옴")
        req.files.forEach(e => {
            model.addFile(e.path, function onMessage(err, rows) {
                callBackCnt++
                // Sql Error
                if (err) {
                } else {
                    // Sql Success
                    filePathList.push({
                        id: rows.insertId,
                        path: e.path
                    })
                }

                // 모든 CallBack 완료 했다면.
                if (callBackCnt == fileSize) {
                    console.log('=================Query Success==============')
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

router.delete('api/uploads', (req, res) => {
    try {
        let idList
        let pathList
        if (Array.isArray(req.query.idList)) {
            idList = req.query.idList
        } else {
            idList = new Array(req.query.idList)
        }

        // DB Query 실행 기준은 File Id 리스트 기준.
        const callBackLength = pathList.length
        let callBackCnt = 0
        for (let i = 0; i < callBackLength; i++) {
            model.deleteFile(pathList[i], function onMessage(err, rows) {
                callBackCnt++
                // Sql Error 
                if (err) {
                    console.log('Sql Error')
                    console.log(err)
                } else {
                    // Sql Success
                    console.log('Sql Success')
                    console.log(rows)
                }

                try {
                    const deletePath = '' + pathList[i]
                    console.log('Delete Path ' + deletePath)
                    fs.unlinkSync(deletePath)
                } catch (err) {
                    console.log('File Delete Error')
                    console.log(err)
                }

                // 모든 CallBack 완료 했다면.
                if (callBackCnt == callBackLength) {
                    console.log('Delete Query Successs')
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