var path = require('path'),
    express = require('express'),
    http = require('http'),
    fs = require('fs');

var app = express();

var async = require('async');
var socketio = require('socket.io');
var lessMiddleware = require('less-middleware');

// Configuration
app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });

    app.use(express.logger());
    app.use(express.bodyParser({defer: true}));
    app.use(express.methodOverride());

    app.use(express.cookieParser('SuperSecret'));
    app.use(express.session());
    // app.use(express.favicon(__dirname +'favicon.ico?v=2'));

    app.use(lessMiddleware({
        src: __dirname + '/public/less',
        dest: __dirname + '/public/css',
        prefix: '/css',
        compress: true
    }));

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});

app.use(express.bodyParser());

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    app.use(express.errorHandler());
});

// Get file mapping
var lightMapping;
fs.readFile('./lightHouseConfig/lightMapping.txt', function (err, data) {
    if (err) throw err;

    var lightMapping = data
    app.lightMapping = lightMapping;
    // console.log("DATA: " + JSON.stringify(JSON.parse(app.lightMapping)));
});

// Setup routes
require('./routes')(app);

// Other apps
// require('./gpsManager')(app);
require('./uploadManager')(app);

var isWin = !!process.platform.match(/^win/);

var ipAddress = '192.168.1.64';
if(isWin)
{
    ipAddress = 'localhost'
}

var listening = http.createServer(app).listen(80, ipAddress, function() {
    console.log("Express server listening on %s:%d in %s mode", ipAddress, 80, app.settings.env);
});

// Socket IO (chatting stuff)
var io = socketio.listen(listening);

var messages = [];
var sockets = [];

setInterval(function(){
    while(messages.length > 10) {
        messages.shift();
    }
}, 5000);

io.on('connection', function (socket) {
        
    messages.forEach(function (data) {
        socket.emit('message', data);
    });

    sockets.push(socket);

    socket.on('disconnect', function () {
        sockets.splice(sockets.indexOf(socket), 1);
        updateRoster();
    });

    socket.on('message', function (msg) {
      var text = String(msg || '');

      if (!text)
        return;

      socket.get('name', function (err, name) {
        var data = {
          name: name,
          text: text
        };

        broadcast('message', data);
        messages.push(data);
      });
    });

    socket.on('identify', function (name) {
      socket.set('name', String(name || 'Anonymous'), function (err) {
        updateRoster();
      });
    });
  });

function updateRoster() {
  async.map(
    sockets,
    function (socket, callback) {
      socket.get('name', callback);
    },
    function (err, names) {
      broadcast('roster', names);
    }
  );
}

function broadcast(event, data) {
  sockets.forEach(function (socket) {
    socket.emit(event, data);
  });
}
// End Socket IO