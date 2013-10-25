var csvjs = require('csv-json');
var ftpGet = require('ftp-get')
var jsftp = require('jsftp');
var fs = require('fs');
var async = require('async');

var conf = require('./gpsCreds');

var gpsIsDirty = true;

module.exports = function (app) {

  console.log("Starting GPS manager.");

    // Pull form FTP server
    // downloadFiles();

    // Add CSV files to memory initially
    addCsvFilesToMemory(app);

    // Download all files in intervals
    var ftpConnectFrequencyMins = 30;
    setInterval(function(){downloadFiles();}, 60000 * ftpConnectFrequencyMins);

    // gpsIsDirty flag should keep it from killing to CPU
    setInterval(function(){addCsvFilesToMemory(app);}, 10000);
};

// Periodically download GPS files
function downloadFiles() {

    var host = conf.creds.host;
    var port = conf.creds.port;
    var user = conf.creds.user`;
    var pass = conf.creds.pass;

    console.log("Connecting to FTP server. Downloading GPS files...");

    var ftp = new jsftp({
      host: host,
      port: port, // defaults to 21
      user: user, // defaults to "anonymous"
      pass: pass // defaults to "@anonymous"
    });

    // Use jsftp to list files
    ftp.ls("./GPSLogger/", function(err, res) {
      if(err){
        console.log("FTP connection failure: " + err);
        return;
      }

      res.forEach(function(file) {
        
        // Use ftp-get to get each one!
        ftpGet.get('ftp://' + user + ':' + pass + '@' + host + '/GPSLogger/' + file.name , './gpsLog/' + file.name, function (error, result) {
          if (error) {
            console.error(error);
          } else {
            console.log('File downloaded at: ' + result);
            gpsIsDirty = true;
          }
        });

      });
    });
}

// Parse CSV files to memory (app.jsonFromCsv)
function addCsvFilesToMemory(app) {

    if(gpsIsDirty) {

        console.log("Adding GPS coords to memory");

        gpsIsDirty = false;

        fs.readdir("gpsLog/", function(err, files){
          if(err) throw err;

          // for each file... (get file name and dateString)

          async.each(files, function(fileName){

            convertCsvToJson("gpsLog/" + fileName, function(json){

              var dateString = fileName.substring(0, fileName.indexOf('.'));
              appendCsvJsonToMemory(json, app, dateString);
            });

          });

        });

    }
}

function convertCsvToJson(csvFile, callback) {

    // time,lat,lon,elevation,accuracy,bearing,speed
    var jsonFromCsv;

    csvjs.parseCsv(csvFile, 
        { rules: 
            {
                time: {path: 'time'},
                lat: {path: 'lat'},
                lon: {path: 'lon'},
                elevation: {path: 'elevation'},
                accuracy: {path: 'accuracy'},
                bearing: {path: 'bearing'},
                speed: {path: 'speed'},
            },
        options: {
          delimiter: ','
        }},
        function(error, json, stats){
          if(error) throw error;

          // Convert to GeoJSON and cache in memory
          // jsonFromCsv = convertJsonToGeoJson(json);
          callback(json);
        }
      );
}

function appendCsvJsonToMemory(json, app, dateString) {

  if(!app.jsonFromCsv) {
    
    // init
    app.jsonFromCsv = [];
  }

  var isAdded = false;

  for(i = 0; i < app.jsonFromCsv.length; i++) {

    var elem = app.jsonFromCsv[i];
    if(elem.date == dateString){
      elem.data = json;
      isAdded = true;
      break;
    }
  }

  if(!isAdded){

    app.jsonFromCsv.push({
      "date":dateString,
      "data": json
    });
  }
}

function convertPointToGeo(point){
  var geoPoint = [point.time, point.lat, point.lon];

  return geoPoint;
}