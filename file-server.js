const express = require('express');
const session = require('express-session');
const fileStore = require('session-file-store')(session)
const serveStatic = require('serve-static')
const fs = require('fs')
const path = require('path')
const utils = require('./utils/commandUtil')
const app = express()
const api = require('./routes/index')
require('dotenv').config()
require('./db/db_config').init()

app.use(require('cors'));
app.use('/resource', serveStatic(path.join(__dirname, 'resource')))
app.use(express.urlencoded({
    limit: "50mb",
    extended: true
}))
app.use(express.json({
    limit: "50mb"
})); // API Call 할때.                            
app.use('/', api);
const concat = require('concat-stream');
app.use(function (req, res, next) {
    req.pipe(concat(function (data) {
        req.body = data;
        next();
    }));
});
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: new fileStore()
}));

// Handle Error Setting
app.use(function (err, req, res, next) {
    console.log('Handle Error\t' + err + '\n\turl\t' + req.url);
    next(err);
  });
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.send(err || 'Error!!');
  });

utils.checkDir(fs, process.env.UPLOAD_ROOT, function (isSuccess, msg) {
    if (isSuccess) {
        utils.checkDir(fs, process.env.UPLOAD_IMG, null)
        utils.checkDir(fs, process.env.UPLOAD_TXT, null)
        utils.checkDir(fs, process.env.UPLOAD_ETC, null)
        utils.checkDir(fs, process.env.UPLOAD_VIDEO, null)
    } else {
        console.log("실패! " + msg);
    }
})

require('http').createServer(app).listen(process.env.PORT, () => {
    console.log('Http Server Start, Port: ' + process.env.PORT);
})