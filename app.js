var twilio = require('twilio'),
    express = require('express');
    
// Create an express web app
var app = express();

// Use middleware to parse incoming form bodies
app.use(express.urlencoded());

// Create a webhook that handles an incoming SMS
app.post('/sms', twilio.webhook(), function(request, response) {
    // Create a TwiML response
    var twiml = new twilio.TwimlResponse();
    twiml.message('Hello from node.js!');
    
    // Render the TwiML response as XML
    response.send(twiml);
});

// Have express create an HTTP server that will listen on port 3000
// or "process.env.PORT", if defined
app.listen(process.env.PORT || 3000);