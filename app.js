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

var app = express();

app.set('port', process.env.PORT || 5000);
app.use(bodyParser.json({ verify: verifyRequestSignature }));
app.use('/static', express.static('public'));



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
  var messageAttachments = message.attachments;

  if (messageText) {

    // If we receive a text message, check to see if it matches any special
    // keywords and send back the corresponding example. Otherwise, just echo
    // the text we received.
    switch (messageText) {
      case 'image':
        sendImageMessage(event.sender);
        break;

      case 'button':
        sendButtonMessage(senderID);
        break;

      case 'generic':
        sendGenericMessage(senderID);
        break;

      case 'receipt':
        sendReceiptMessage(senderID);
        break;

      default:
        sendTextMessage(senderID, messageText);
    }
  } else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
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
          url: "https://webhookpeter.herokuapp.com/static/" + isbn + "/" + page + "/" + ex + ".PNG"
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
      sessions[recipientId] = {user: user, isbn: '', page: '', ex: '', lastOutput: ''}
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

function reply(recipientId, messageText) {
  var text;
  switch (sessions[recipientId].lastOutput) {
    case '':
      var isbnPattern = new RegExp("((?:[0-9]-?){10,20})","i");
      var isbnMatcher = isbnPattern.exec(messageText);
      if (isbnMatcher != null && isbnMatcher.length > 1) {
        var tmpIsbn = isbnMatcher[1]
        tmpIsbn = tmpIsbn.replace(/-/g, "");
        tmpIsbn = tmpIsbn.replace(' ', '');
        sessions[recipientId].isbn = tmpIsbn;
        console.log("ISBN Number is valid and number is : " + tmpIsbn);
      }
      var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})","i");
      var pageMatcher = pagePattern.exec(messageText);
      if (pageMatcher != null && pageMatcher.length > 1) {
        sessions[recipientId].page = pageMatcher[1];
        console.log("Page Number is valid and number is : " + pageMatcher[1]);
      }
      var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})","i");
      var exMatcher = exPattern.exec(messageText);
      if (exMatcher != null && exMatcher.length > 1) {
        sessions[recipientId].ex = exMatcher[1];
        console.log("Exercice Number is valid and number is : " + exMatcher[1]);
      }
      break;
    case 'isbn':
      var isbnPattern = new RegExp("((?:[0-9]-?){10,20})","i");
      var isbnMatcher = isbnPattern.exec(messageText);
      if (isbnMatcher != null && isbnMatcher.length > 1) {
        var tmpIsbn = isbnMatcher[1];
        tmpIsbn = tmpIsbn.replace(/-/g, "");
        tmpIsbn = tmpIsbn.replace(' ', '');
        sessions[recipientId].isbn = tmpIsbn;
        console.log("ISBN Number is valid and number is : " + tmpIsbn);
      }
      break;
    case
    'page'
    :
      var pagePattern = new RegExp("([0-9]{1,3})","i");
      var pageMatcher = pagePattern.exec(messageText);
      if (pageMatcher != null && pageMatcher.length > 1) {
        sessions[recipientId].page = pageMatcher[1];
        console.log("Page Number is valid and number is : " + pageMatcher[1]);
      }
      break;
    case
    'ex'
    :
      var exPattern = new RegExp("([0-9]{1,3})","i");
      var exMatcher = exPattern.exec(messageText);
      if (exMatcher != null && exMatcher.length > 1) {
        sessions[recipientId].ex = exMatcher[1];
        console.log("Exercice Number is valid and number is : " + exMatcher[1]);
      }
      break;
  }

  if (sessions[recipientId].isbn == '') {
    text = "Bonjour " + sessions[recipientId].user.first_name + ",pour pouvoir t'aider, j'ai besoin du numéro ISBN de ton livre, il se trouve au niveau du code barre de ton livre. "
    sessions[recipientId].lastOutput = 'isbn';
  } else if (sessions[recipientId].page == '') {
    text = "Peux tu me donner le numéro de la page de ton exercice stp?"
    sessions[recipientId].lastOutput = 'page';
  } else if (sessions[recipientId].ex == '') {
    text = "Peux tu me donner le numéro de ton exercice stp?"
    sessions[recipientId].lastOutput = 'ex';
  } else {
    sessions[recipientId].lastOutput = '';
    text = "Tadam! ISBN: " + sessions[recipientId].isbn + " PAGE: " + sessions[recipientId].page + " EX: " + sessions[recipientId].ex;
    text += " Est-ce que la solution te convient?";
    sendImageMessage(recipientId, sessions[recipientId].isbn, sessions[recipientId].page, sessions[recipientId].ex)
    sessions[recipientId] = {user: sessions[recipientId].user, isbn: '', page: '', ex: '', lastOutput: ''}
  }
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: text
    }
  }
  callSendAPI(messageData);
}


/*
 * Send a button message using the Send API.
 *
 */
function sendButtonMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "This is test text",
          buttons:[{
            type: "web_url",
            url: "https://www.oculus.com/en-us/rift/",
            title: "Open Web URL"
          }, {
            type: "postback",
            title: "Call Postback",
            payload: "Developer defined postback"
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
function sendGenericMessage(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "generic",
          elements: [{
            title: "rift",
            subtitle: "Correct",
            image_url: "https://www.dropbox.com/s/nsyzfgjiuwr7n9q/9782091724935-248A.jpg?dl=0",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/rift/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for first bubble",
            }],
          }, {
            title: "touch",
            subtitle: "Correct",
            image_url: "https://www.dropbox.com/s/nsyzfgjiuwr7n9q/9782091724935-248A.jpg?dl=0",
            buttons: [{
              type: "web_url",
              url: "https://www.oculus.com/en-us/touch/",
              title: "Open Web URL"
            }, {
              type: "postback",
              title: "Call Postback",
              payload: "Payload for second bubble",
            }]
          }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

/*
 * Send a receipt message using the Send API.
 *
 */
function sendReceiptMessage(recipientId) {
  // Generate a random receipt ID as the API requires a unique ID
  var receiptId = "order" + Math.floor(Math.random()*1000);

  var messageData = {
    recipient: {
      id: recipientId
    },
    message:{
      attachment: {
        type: "template",
        payload: {
          template_type: "receipt",
          recipient_name: "Peter Chang",
          order_number: receiptId,
          currency: "USD",
          payment_method: "Visa 1234",        
          timestamp: "1428444852", 
          elements: [{
            title: "Oculus Rift",
            subtitle: "Includes: headset, sensor, remote",
            quantity: 1,
            price: 599.00,
            currency: "USD",
            image_url: "http://messengerdemo.parseapp.com/img/riftsq.png"
          }, {
            title: "Samsung Gear VR",
            subtitle: "Frost White",
            quantity: 1,
            price: 99.99,
            currency: "USD",
            image_url: "http://messengerdemo.parseapp.com/img/gearvrsq.png"
          }],
          address: {
            street_1: "1 Hacker Way",
            street_2: "",
            city: "Menlo Park",
            postal_code: "94025",
            state: "CA",
            country: "US"
          },
          summary: {
            subtotal: 698.99,
            shipping_cost: 20.00,
            total_tax: 57.67,
            total_cost: 626.66
          },
          adjustments: [{
            name: "New Customer Discount",
            amount: -50
          }, {
            name: "$100 Off Coupon",
            amount: -100
          }]
        }
      }
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

