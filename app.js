var twilio = require('twilio'),
    express = require('express'),
    routes = require('./routes'),
    user = require('./routes/user'),
    http = require('http'),
    path = require('path');
    
// Create an express web app
var app = express();

// all environments
//app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Use middleware to parse incoming form bodies
app.use(express.urlencoded());

app.get('/', routes.index);
app.get('/users', user.list);

// Create a new REST API client to make authenticated requests against the twilio back end
//var client = new twilio.RestClient(config.twilio.sid, config.twilio.key);
var client = new twilio.RestClient(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_ACCOUNT_KEY);

app.get('/outbound/sms', routes.outboundSMS);
app.post('/outbound/sms', function(request, response) {
    //console.dir(request.body.name + ', ' + request.body.message);
    // Pass in parameters to the REST API using an object literal notation. The
    // REST client will handle authentication and response serialzation for you.
    client.sms.messages.create({
        to:request.body.mobile,
        from:process.env.TWILIO_NUMBER, //config.twilio.number,
        body:request.body.name + ', ' + request.body.message
    }, function(error, message) {
        // The HTTP request to Twilio will run asynchronously. This callback
        // function will be called when a response is received from Twilio
        // The "error" variable will contain error information, if any.
        // If the request was successful, this value will be "falsy"
        if (!error) {
            // The second argument to the callback will contain the information
            // sent back by Twilio for the request. In this case, it is the
            // information about the text messsage you just sent:
            console.log('Success! The SID for this SMS message is:');
            console.log(message.sid);
     
            console.log('Message sent on:');
            console.log(message.dateCreated);

            response.render('outboundSMS', { title: 'Send an SMS (text) message', outboundMessage: 'SMS (Text) Message sent successfully'});

        } else {
            console.log('Oops! There was an error.');
            console.dir(error);

            response.render('outboundSMS', { title: 'Send an SMS (text) message', outboundMessage: 'There was an Error. SMS (Text) Message was not sent successfully. ' + error.message});

        }
    });
});

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
app.post('/inbound', twilio.webhook({validate:false}), function(request, response) {
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
        if(m.hour() >= 5 && m.hour() <= 10) {
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