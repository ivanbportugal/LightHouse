var lessMiddleware = require('less-middleware');

var upload = require('jquery-file-upload-middleware');

module.exports = function (app) {

    // configuration
    var conf = require('./config');
    var resizeConf = conf.resizeVersion;
    var dirs = conf.directors;

    // Upload settings
    app.use('/upload', function (req, res, next) {
        upload.fileHandler({
            tmpDir: dirs.temp,
            uploadDir: __dirname + dirs.default,
            uploadUrl: dirs.default_url,
            imageVersions: resizeConf.default
        })(req, res, next);
    });

    // List files
    app.use('/upload/list', function (req, res, next) {
        upload.fileManager({
            uploadDir: function () {
                return __dirname + dirs.default;
            },
            uploadUrl: function () {
                return dirs.default_url;
            }
        }).getFiles(function (files) {
            console.log("FILES in dir: " + files);
            res.json(files);
        });
    });

    // bind events...
    upload.on('end', function (fileInfo) {
        // insert file info
        console.log("files upload complete");
        console.log(fileInfo);
    });

    upload.on('delete', function (fileName) {
        // remove file info
        console.log("files remove complete");
        console.log(fileName);
    });

    upload.on('error', function (e) {
        console.log(e.message);
    });

    // starting point for app
    app.get('/files', function(req, res){
        res.render('uploads', {title: 'File Castle', description: 'Castle In The Cloud'});
    });
};