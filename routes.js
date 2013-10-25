var sys = require('sys');
var exec = require('child_process').exec;

module.exports = function (app) {

    // Light House
    app.get('/', function (req, res) {

        res.render('index', { 'lightMapping' : app.lightMapping, title: 'Light House', description: 'Controls the lights in the house' });
    });

    app.post('/activate', function (req, res) {

    	var command = req.body.command;
    	var fullCommand = 'echo "rf ' + command + '" | nc localhost 1099';

        // Execute command line
        var isWin = !!process.platform.match(/^win/);
        if(isWin)
        {
        	console.log('(windows) X10 MOCK command executed: ' + fullCommand);
        } else {
        	console.log('X10 command executed: ' + fullCommand);
        	
			exec(fullCommand, puts);
        }

        // Response
        res.redirect('/');
    });

    // chat
    app.get('/chat', function (req, res) {
        res.render("chat", {title: 'Gossip Room', description: 'Just some harmless gossip'});
    });

    // GPS
    app.get('/tracker', function (req, res) {
        
        var daysArray = [];
        for(i = 0; i < app.jsonFromCsv.length; i++){
            daysArray.push(app.jsonFromCsv[i].date);
        }

        function descending( a, b ) {
            return b - a;
        }
         
        daysArray.sort( descending );

        res.render("tracker", {title: 'GPS tracker', description: 'Ivan\'s travels', days: daysArray});
    });

    app.post('/dailyPosition', function(req, res){
        
        res.send(JSON.stringify(app.jsonFromCsv));
    });
    // End GPS
};

function puts(error, stdout, stderr) {
	sys.puts(stdout)
}