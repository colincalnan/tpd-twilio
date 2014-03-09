var twilio = require('twilio'),
    express = require('express');
    
// Create an express web app
var app = express();

// Use middleware to parse incoming form bodies
app.use(express.urlencoded());

// Create a webhook that handles an incoming SMS
app.post('/sms', twilio.webhook({
  validate:false
}), function(request, response) {
    // Create a TwiML response
    var twiml = new twilio.TwimlResponse();
    twiml.message('Hello from node.js!');
    
    // Render the TwiML response as XML
    response.send(twiml);
});

// Create a webhook that handles an incoming SMS
app.post('/inbound', twilio.webhook(), function(request, response) {
    // Create a TwiML response
    var twiml = new twilio.TwimlResponse();

    // Set up a moment
    var moment = require('moment');
    m = moment();

    // Set a location
    var locations = { 
        'Vancouver' :  '18886853530', 
        'Calgary'   :  '18552667030',
    }

    // If it's a weekday
    if(m.day() <= 6) {
        // Set everything to UTC as we don't know what server this will be on.
        m.utc();
        // Set Zone to Vancuver
        m.zone("-08:00");
        // If it's between 5am and 8am in Vancouver then call Montreal, otherwise call Vancouver
        if(m.hour() >= 5 && m.hour() <= 8) {
            location = 'Calgary';
        } else {
            location = 'Vancouver';
        }
    }
    twiml.say({voice:'alice', language: 'en-CA'}, 'Please wait, we are connecting you to the ' + location + ' office' );
    twiml.dial(locations[location]);

    // Render the TwiML response as XML
    response.send(twiml);
});

// Have express create an HTTP server that will listen on port 3000
// or "process.env.PORT", if defined
app.listen(process.env.PORT || 3000);