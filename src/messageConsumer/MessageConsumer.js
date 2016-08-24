"use strict";

module.exports = MessageConsumer;

const
    Logger = require('../Logger.js'),
    FacebookMessageSender = require('../messageSender/FacebookMessageSender.js'),
    Message = require('../Message.js'),
    Text = require('../Text.js'),
    IAMessageConsumer = require('./IAMessageConsumer.js'),
    PeterMessageConsumer = require('./PeterMessageConsumer.js'),
    History = require("../History.js"),
    Conversational = require('../Conversational.js');

const IMAGE_URL = "https://webhookpeter.herokuapp.com/static/";

function MessageConsumer(messageSender) {
    var self = this;
    self.messageSender = messageSender;
    self.peter = new PeterMessageConsumer();
    self.peter.setMessageSender(self.messageSender);
    self.ia = new IAMessageConsumer();
    self.ia.setNextConsumer(self.peter);
    self.ia.setMessageSender(self.messageSender);
}

MessageConsumer.prototype.consumeRequest = function (req, res) {
    var self = this;
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
                    self.consumeAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    self.consumeMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    self.consumeDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    self.consumePostback(messagingEvent);
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
};

/*
 * Postback Event
 *
 * This event is called when a postback is tapped on a Structured Message. Read
 * more at https://developers.facebook.com/docs/messenger-platform/webhook-reference#postback
 *
 */
MessageConsumer.prototype.consumePostback = function (event) {
    var self = this;
    Logger.log(event);
    /**
     *
     * Use Bellow
     * @type {string}
     */
    var senderId = event.sender.id;
    var recipientId = event.recipient.id;
    var timeOfPostback = event.timestamp;

    // The 'payload' param is a developer-defined field which is set in a postback
    // button for Structured Messages.
    var payload = JSON.parse(event.postback.payload);
        if (payload.action) {
            eval(payload.action);
        }
        if (payload.message) {
            var messageData = Message.get(payload.message);
            self.messageSender.sendMessageData(senderId,messageData);
        }

};

MessageConsumer.prototype.start = function(senderId){
    var self = this;
    History.clear(senderId);
    History.get(senderId).lastOutput = 'isbn';
    self.messageSender.sendTextMessage(senderId,Text.get("hello"));
    self.messageSender.sendImageMessage(senderId, IMAGE_URL +"assets/img/isbn.jpg");

};

/*
 * Authorization Event
 *
 * The value for 'optin.ref' is defined in the entry point. For the "Send to
 * Messenger" plugin, it is the 'data-ref' field. Read more at
 * https://developers.facebook.com/docs/messenger-platform/webhook-reference#auth
 *
 */
MessageConsumer.prototype.consumeAuthentication = function(event) {
    var  self = this;

    Logger.log(event);
    var senderId = event.sender.id;
    var recipientId = event.recipient.id;
    var timeOfAuth = event.timestamp;

    // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
    // The developer can set this to an arbitrary value to associate the
    // authentication callback with the 'Send to Messenger' click event. This is
    // a way to do account linking when the user clicks the 'Send to Messenger'
    // plugin.
    var passThroughParam = event.optin.ref;

    console.log("Received authentication for user %d and page %d with pass " +
        "through param '%s' at %d", senderId, recipientId, passThroughParam,
        timeOfAuth);

    self.messageSender.sendMessageData(senderId, Message.get("welcome_message"));

    // When an authentication is received, we'll send a message back to the sender
    // to let them know it was successful.
    //self.messageSender.sendTextMessage(senderId, "Authentication successful");
};



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
MessageConsumer.prototype.consumeMessage = function(event) {
    var self = this;

    var senderId = event.sender.id;
    var recipientId = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;
    var match = false;

    if(message.is_echo == undefined || !message.is_echo) {
        Logger.log(event);
        //var messageAttachments = message.attachments;
        if (History.get(senderId) == undefined || History.get(senderId).user == undefined) {
            self.messageSender.getUserData(senderId, function (user) {
                History.clear(senderId);
                History.get(senderId).user = user;
                console.log("Reply for " + senderId + ", " + History.get(senderId).nbMessage);
                var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
                var isbnMatcher = isbnPattern.exec(message.text);
                if (isbnMatcher != null && isbnMatcher.length > 1) {
                    var tmpIsbn = isbnMatcher[1];
                    //message.text = message.text.replace(isbnMatcher[1],"");
                    tmpIsbn = tmpIsbn.replace(/-/g, "");
                    tmpIsbn = tmpIsbn.replace(' ', '');
                    History.get(recipientId).isbn = tmpIsbn;
                    console.log("ISBN Number is valid and number is : " + tmpIsbn);
                    History.resetTry(recipientId);
                    match = true;
                }
                var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})", "i");
                var pageMatcher = pagePattern.exec(message.text);
                if (pageMatcher != null && pageMatcher.length > 1) {
                    //message.text = message.text.replace(pageMatcher[1],"");
                    History.get(recipientId).page = pageMatcher[1];
                    console.log("Page Number is valid and number is : " + pageMatcher[1]);
                    History.resetTry(recipientId);
                    match = true;
                }else{
                    match = false;
                }
                var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})", "i");
                var exMatcher = exPattern.exec(message.text);
                if (exMatcher != null && exMatcher.length > 1) {
                    //message.text = message.text.replace(exMatcher[1],"");
                    History.get(recipientId).ex = exMatcher[1];
                    console.log("Exercice Number is valid and number is : " + exMatcher[1]);
                    History.resetTry(recipientId);
                    match = true;
                }else{
                    match = false;
                }
                History.get(senderId).nbMessage++;
                if(match) {
                    self.peter.consumeMessage(senderId, message);
                }else{
                    self.ia.consumeMessage(senderId, message);
                }
            });

        } else {
            console.log("Reply for " + senderId + ", " + History.get(senderId).nbMessage);
            var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
            var isbnMatcher = isbnPattern.exec(message.text);
            if (isbnMatcher != null && isbnMatcher.length > 1) {
                var tmpIsbn = isbnMatcher[1];
                //message.text = message.text.replace(isbnMatcher[1],"");
                tmpIsbn = tmpIsbn.replace(/-/g, "");
                tmpIsbn = tmpIsbn.replace(' ', '');
                History.get(recipientId).isbn = tmpIsbn;
                console.log("ISBN Number is valid and number is : " + tmpIsbn);
                History.resetTry(recipientId);
                match = true;
            }
            var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})", "i");
            var pageMatcher = pagePattern.exec(message.text);
            if (pageMatcher != null && pageMatcher.length > 1) {
                //message.text = message.text.replace(pageMatcher[1],"");
                History.get(recipientId).page = pageMatcher[1];
                console.log("Page Number is valid and number is : " + pageMatcher[1]);
                History.resetTry(recipientId);
                match = true;
            }else{
                match = false;
            }
            var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})", "i");
            var exMatcher = exPattern.exec(message.text);
            if (exMatcher != null && exMatcher.length > 1) {
                //message.text = message.text.replace(exMatcher[1],"");
                History.get(recipientId).ex = exMatcher[1];
                console.log("Exercice Number is valid and number is : " + exMatcher[1]);
                History.resetTry(recipientId);
                match = true;
            }else{
                match = false;
            }
            History.get(senderId).nbMessage++;
            if(match) {
                self.peter.consumeMessage(senderId, message);
            }else{
                self.ia.consumeMessage(senderId, message);
            }
        }
    }else{
        console.log("Ignoring echo");
    }
};





/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference#message_delivery
 *
 */
MessageConsumer.prototype.consumeDeliveryConfirmation  = function(event) {
    var self = this;
    self.messageSender.receivedDeliveryConfirmation(event);
};

MessageConsumer.prototype.isFirstMessage = function(senderId){
    return History.get(senderId) == null || History.get(senderId).nbMessage ==0;
};



