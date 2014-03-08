// Require the twilio and HTTP modules
var twilio = require('twilio'),
    http = require('http');

// Set up a moment
var moment = require('moment');
m = moment();

// Set a location
var locations = { 
    'Vancouver' :  '7782324787', 
    'Montreal'  :  '7789286450',
}

// If it's a weekday
if(m.day() < 6) {
    // Set everything to UTC as we don't know what server this will be on.
    m.utc();
    // Set Zone to Vancuver
    m.zone("-08:00");
    // If it's between 5am and 8am in Vancouver then call Montreal, otherwise call Vancouver
    if(m.hour() >= 5 && m.hour() <= 8) {
        location = 'Montreal';
    } else {
        location = 'Vancouver';
    }
}

// Create an HTTP server, listening on port 1337
http.createServer(function (req, res) {
    // Create a TwiML response and a greeting
    var resp = new twilio.TwimlResponse();
    resp.say({voice:'alice', language: 'en-CA'}, 'Please wait, we are connecting you to the ' + location + ' office' );
    resp.dial(locations[location]);
 
    //Render the TwiML document using "toString"
    res.writeHead(200, {
        'Content-Type':'text/xml'
    });
    res.end(resp.toString());
 
}).listen(1337);
 
console.log('Visit http://localhost:1337/ in your browser to see your TwiML document!');