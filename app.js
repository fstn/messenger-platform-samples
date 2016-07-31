/*
 * Copyright 2016-present, FacebookMessageSender, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* jshint node: true, devel: true */
'use strict';

const 
  bodyParser = require('body-parser'),
  express = require('express'),
  https = require('https'),
    MessageConsumer = require('./src/messageConsumer/MessageConsumer.js'),
    BookService = require('./src/services/BookService.js'),
    FacebookMessageSender = require('./src/messageSender/FacebookMessageSender.js');


/*
 * Be sure to setup your config values before running this code. You can
 * set them using environment variables or modifying the config file in /config.
 *
 */
var facebook = new FacebookMessageSender();
var messageConsumer = new MessageConsumer(facebook);

var app = express();

/**
 * Rest API that manage books
 * @type {BookService}
 */
var bookService = new BookService(app);

app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json({verify: facebook.verifyRequestSignature}));
app.use('/static', express.static('book'));




/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function(req, res) {
  facebook.verifyToken(req, res);
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/implementation#subscribe_app_pages
 *
 */
app.post('/webhook', function (req, res) {
  messageConsumer.consumeRequest(req,res);
});


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;

