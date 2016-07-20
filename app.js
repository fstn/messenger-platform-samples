/*
 * Copyright 2016-present, Facebook, Inc.
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
  config = require('config'),
  crypto = require('crypto'),
  express = require('express'),
  https = require('https'),  
  request = require('request'),
  apiai = require('apiai');


/*
 * Be sure to setup your config values before running this code. You can
 * set them using environment variables or modifying the config file in /config.
 *
 */
var fs = require('fs');
var mapping = JSON.parse(fs.readFileSync('./book/mapping.json', 'utf8'));


var app = express();

app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use('/static', express.static('book'));

var msg = config.get('text');
var sessions = {};


// App Secret can be retrieved from the App Dashboard
const APP_APIAP = (process.env.MESSENGER_APP_SECRET) ?
    process.env.MESSENGER_APP_SECRET :
    config.get('apiaiKey');


// App Secret can be retrieved from the App Dashboard
const APP_SECRET = (process.env.MESSENGER_APP_SECRET) ? 
  process.env.MESSENGER_APP_SECRET :
  config.get('appSecret');

// Arbitrary value used to validate a webhook
const VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN) ?
  (process.env.MESSENGER_VALIDATION_TOKEN) :
  config.get('validationToken');

// Generate a page access token for your page from the App Dashboard
const PAGE_ACCESS_TOKEN = (process.env.MESSENGER_PAGE_ACCESS_TOKEN) ?
  (process.env.MESSENGER_PAGE_ACCESS_TOKEN) :
  config.get('pageAccessToken');

if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
  console.error("Missing config values");
  process.exit(1);
}

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function(req, res) {
  if (req.query['hub.mode'] === 'subscribe' &&
      req.query['hub.verify_token'] === VALIDATION_TOKEN) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/implementation#subscribe_app_pages
 *
 */
app.post('/webhook', function (req, res) {
  var data = req.body;

  console.log("data "+JSON.stringify(data));
  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.optin) {
          receivedAuthentication(messagingEvent);
        } else if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.delivery) {
          receivedDeliveryConfirmation(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
  var signature = req.headers["x-hub-signature"];

  if (!signature) {
    // For testing, let's log an error. In production, you should throw an 
    // error.
    console.error("Couldn't validate the signature.");
  } else {
    var elements = signature.split('=');
    var method = elements[0];
    var signatureHash = elements[1];

    var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                        .update(buf)
                        .digest('hex');

    if (signatureHash != expectedHash) {
      throw new Error("Couldn't validate the request signature.");
    }
  }
}

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to 
 * Messenger" plugin, it is the 'data-ref' field. Read more at 
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference#auth
 *
 */
function receivedAuthentication(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfAuth = event.timestamp;

  // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
  // The developer can set this to an arbitrary value to associate the 
  // authentication callback with the 'Send to Messenger' click event. This is
  // a way to do account linking when the user clicks the 'Send to Messenger' 
  // plugin.
  var passThroughParam = event.optin.ref;

  console.log("Received authentication for user %d and page %d with pass " +
    "through param '%s' at %d", senderID, recipientID, passThroughParam, 
    timeOfAuth);

  // When an authentication is received, we'll send a message back to the sender
  // to let them know it was successful.
  sendTextMessage(senderID, "Authentication successful");
}


/*
 * Message Event
 *
 * This event is called when a message is sent to your page. The 'message' 
 * object format can vary depending on the kind of message that was received.
 * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#received_message
 *
 * For this example, we're going to echo any text that we get. If we get some 
 * special keywords ('button', 'generic', 'receipt'), then we'll send back
 * examples of those bubbles to illustrate the special message bubbles we've 
 * created. If we receive a message with an attachment (image, video, audio), 
 * then we'll simply confirm that we've received the attachment.
 * 
 */
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log(JSON.stringify(event));

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log("Message received: "+JSON.stringify(message));
  console.log(JSON.stringify(event.sender));
  console.log(JSON.stringify(event.recipient));
  var messageId = message.mid;

  // You may get a text or attachment but not both
  var messageText = message.text;
  //var messageAttachments = message.attachments;

  sendTextMessage(senderID, messageText);
}


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about 
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference#message_delivery
 *
 */
function receivedDeliveryConfirmation(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var delivery = event.delivery;
  var messageIDs = delivery.mids;
  var watermark = delivery.watermark;
  var sequenceNumber = delivery.seq;

  if (messageIDs) {
    messageIDs.forEach(function(messageID) {
      console.log("Received delivery confirmation for message ID: %s", 
        messageID);
    });
  }

  console.log("All message before %d were delivered.", watermark);
}


/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. Read
 * more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#postback
 * 
 */
function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;

  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);

  // When a postback is called, we'll send a message back to the sender to 
  // let them know it was successful
  sendTextMessage(senderID, "Postback called");
}

function fileExists(isbn, page, ex){
  return mapping[isbn][page] != undefined;
}

/*
 * Send a message with an using the Send API.
 *
 */
function sendImageMessage(sender, isbn, page, ex) {
  var messageData = {
    recipient: {
      id: sender
    },
    message: {
      attachment: {
        type: "image",
        payload: {
          url: "https://webhookpeter.herokuapp.com/static/" + isbn + "/" + mapping[isbn][page] + ".jpg"
        }
      }
    }
  };

  callSendAPI(messageData);
}

/*
 * Send a text message using the Send API.
 *
 */

function sendTextMessage(recipientId, messageText) {


  if (typeof sessions[recipientId] == 'undefined') {
    callUserAPI(recipientId,function (user) {
      sessions[recipientId] = {user: user};
      clearSession(recipientId,user);
      reply(recipientId, messageText);
    });
  } else {
    reply(recipientId, messageText);
    }


  /*
    callIA("Je suis" + user.first_name + " " + messageText, function (response) {
          var msg = response.result.fulfillment.speech


          var messageData = {
            recipient: {
              id: recipientId
            },
            message: {
              text: msg
            }
        }
          callSendAPI(messageData);
        }
    )*/
    ;
};

function clearSession(recipientId) {
  if(sessions[recipientId] != undefined ){
    sessions[recipientId].isbn = "";
    sessions[recipientId].page = "";
    sessions[recipientId].ex = "";
    sessions[recipientId].lastOutput = "";
    sessions[recipientId].nbTry = 0;
  }
}

function reply(recipientId, messageText) {
  var text;
  sessions[recipientId].nbTry++;

  if (sessions[recipientId].nbTry >= 6) {
    clearSession(recipientId);
    text = msg.retry.sort(function () {
      return Math.random() - 0.5;
    })[0];
  } else {

    switch (sessions[recipientId].lastOutput) {
      case '':
        var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
        var isbnMatcher = isbnPattern.exec(messageText);
        if (isbnMatcher != null && isbnMatcher.length > 1) {
          var tmpIsbn = isbnMatcher[1]
          tmpIsbn = tmpIsbn.replace(/-/g, "");
          tmpIsbn = tmpIsbn.replace(' ', '');
          sessions[recipientId].isbn = tmpIsbn;
          console.log("ISBN Number is valid and number is : " + tmpIsbn);
          sessions[recipientId].nbTry = 0;
        }
        var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})", "i");
        var pageMatcher = pagePattern.exec(messageText);
        if (pageMatcher != null && pageMatcher.length > 1) {
          sessions[recipientId].page = pageMatcher[1];
          console.log("Page Number is valid and number is : " + pageMatcher[1]);
          sessions[recipientId].nbTry = 0;
        }
        var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})", "i");
        var exMatcher = exPattern.exec(messageText);
        if (exMatcher != null && exMatcher.length > 1) {
          sessions[recipientId].ex = exMatcher[1];
          console.log("Exercice Number is valid and number is : " + exMatcher[1]);
          sessions[recipientId].nbTry = 0;
        }
        break;
      case 'isbn':
        var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
        var isbnMatcher = isbnPattern.exec(messageText);
        if (isbnMatcher != null && isbnMatcher.length > 1) {
          var tmpIsbn = isbnMatcher[1];
          tmpIsbn = tmpIsbn.replace(/-/g, "");
          tmpIsbn = tmpIsbn.replace(' ', '');
          sessions[recipientId].isbn = tmpIsbn;
          console.log("ISBN Number is valid and number is : " + tmpIsbn);
          sessions[recipientId].nbTry = 0;
        }
        break;
      case
      'page'
      :
        var pagePattern = new RegExp("([0-9]{1,3})", "i");
        var pageMatcher = pagePattern.exec(messageText);
        if (pageMatcher != null && pageMatcher.length > 1) {
          sessions[recipientId].page = pageMatcher[1];
          console.log("Page Number is valid and number is : " + pageMatcher[1]);
          sessions[recipientId].nbTry = 0;
        }
        break;
      case
      'ex'
      :
        var exPattern = new RegExp("([0-9]{1,3})", "i");
        var exMatcher = exPattern.exec(messageText);
        if (exMatcher != null && exMatcher.length > 1) {
          sessions[recipientId].ex = exMatcher[1];
          console.log("Exercice Number is valid and number is : " + exMatcher[1]);
          sessions[recipientId].nbTry = 0;
        }
        break;
    }


    if (sessions[recipientId].isbn == '') {
      text = msg.hello.sort(function () {
        return Math.random() - 0.5;
      })[0];

      text = text.replace("#NAME#", sessions[recipientId].user.first_name);

      sessions[recipientId].lastOutput = 'isbn';
    } else if (sessions[recipientId].page == '') {
      text = msg.page.sort(function () {
        return Math.random() - 0.5;
      })[0];
      sessions[recipientId].lastOutput = 'page';
    } else if (sessions[recipientId].ex == '') {
      text = msg.exercise.sort(function () {
        return Math.random() - 0.5;
      })[0];
      sessions[recipientId].lastOutput = 'ex';
    } else {
      sessions[recipientId].lastOutput = '';
      text = msg.result.sort(function () {
        return Math.random() - 0.5;
      })[0];
      text = text.replace("#ISBN#", sessions[recipientId].isbn);
      text = text.replace("#PAGE#", sessions[recipientId].page);
      text = text.replace("#EX#", sessions[recipientId].ex);
      text += msg.isOk.sort(function () {
        return Math.random() - 0.5;
      })[0];
      ;
      if(fileExists( sessions[recipientId].isbn, sessions[recipientId].page, sessions[recipientId].ex)) {
        sendImageMessage(recipientId, sessions[recipientId].isbn, sessions[recipientId].page, sessions[recipientId].ex)
        clearSession(recipientId);
      }else{
        text = msg.fileNotYetAvailable.sort(function () {
          return Math.random() - 0.5;
        })[0];
      }
    }
  }
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text
    }
  };
  callSendAPI(messageData);
}



function callIA(message,callBack){

  var aiapi = apiai(APP_APIAP);
  aiapi.language="FR";
  var request = aiapi.textRequest(message);

  request.on('response', function(response) {
    console.log(response);
    callBack(response);
  });

  request.on('error', function(error) {
    console.log(error);
  });

  request.end()
}


function callUserAPI(senderId,callBack){
  request({
    uri: 'https://graph.facebook.com/v2.7/'+senderId,
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'GET'

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var user = JSON.parse(body);

      console.log("Successfully get user "+
          user.first_name);

      callBack(user);

    } else {
      console.error("Unable to get user info.");
      console.error(response);
      console.error(error);

      callBack({first_name:"unable to find user"});
    }
  });

}
/*
 * Call the Send API. The message data goes in the body. If successful, we'll 
 * get the message id in a response 
 *
 */
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.7/me/messages',
    qs: { access_token: PAGE_ACCESS_TOKEN },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

module.exports = app;

