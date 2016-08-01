"use strict";

module.exports = FacebookMessageSender;

const
    config = require('config'),
    crypto = require('crypto'),
    request = require('request');

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

function FacebookMessageSender(){
    if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
        console.error("Missing config values");
        process.exit(1);
    }
}

FacebookMessageSender.prototype.verifyToken = function(req,res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
};


/*
 * Verify that the callback came from FacebookMessageSender. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
FacebookMessageSender.prototype.verifyRequestSignature= function(req, res, buf) {
    var self = this;

    console.info(req+" "+res);
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
};



/*
 * Send a message with an using the Send API.
 *
 */
FacebookMessageSender.prototype.sendImageMessage= function(senderId,url) {
    var self = this;
    var messageData = {
        recipient: {
            id: senderId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: url
                }
            }
        }
    };

    this.sendMessage(messageData);
};




FacebookMessageSender.prototype.getUserData = function(senderId,callBack){
    var self = this;
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

};


/*
 * Call the Send API. The message data goes in the body. If successful, we'll
 * get the message id in a response
 *
 */
FacebookMessageSender.prototype.sendMessage = function (messageData) {
    var self = this;
    self.messageData = messageData;
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
            console.error("Unable to send message."+JSON.stringify(self.messageData));
            var stack = new Error().stack;
            console.error( stack );
        }
    });
};

/*
 /*
 * Send audio using the Send API.
 *
 */
FacebookMessageSender.prototype.sendMessageData = function (recipientId,messagePart) {
    var self = this;
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: messagePart
    };

    this.sendMessage(messageData);
};

/*
 * Send a Gif using the Send API.
 *
 */
FacebookMessageSender.prototype.sendGifMessage = function (recipientId,url) {
    var self = this;
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "image",
                payload: {
                    url: url
                }
            }
        }
    };

    this.sendMessage(messageData);
};

/*
 * Send audio using the Send API.
 *
 */
FacebookMessageSender.prototype.sendAudioMessage = function (recipientId) {
    var self = this;
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "audio",
                payload: {
                    url: SERVER_URL + "/assets/sample.mp3"
                }
            }
        }
    };

    this.sendMessage(messageData);
};

/*
 * Send a video using the Send API.
 *
 */
FacebookMessageSender.prototype.sendVideoMessage = function(recipientId) {
    var self = this;
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "video",
                payload: {
                    url: SERVER_URL + "/assets/allofus480.mov"
                }
            }
        }
    };

    this.sendMessage(messageData);
};

/*
 * Send a video using the Send API.
 *
 */
FacebookMessageSender.prototype.sendFileMessage = function(recipientId) {
    var self = this;
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "file",
                payload: {
                    url: SERVER_URL + "/assets/test.txt"
                }
            }
        }
    };

    this.sendMessage(messageData);
};

/*
 * Send a button message using the Send API.
 *
 */
FacebookMessageSender.prototype.sendButtonMessage = function(recipientId) {
    var self = this;
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
                        title: "Trigger Postback",
                        payload: "DEVELOPED_DEFINED_PAYLOAD"
                    }, {
                        type: "phone_number",
                        title: "Call Phone Number",
                        payload: "+16505551234"
                    }]
                }
            }
        }
    };

    this.sendMessage(messageData);
};


/*
 * Turn typing indicator on
 *
 */
FacebookMessageSender.prototype.ssendTypingOn = function(recipientId) {
    var self = this;
    console.log("Turning typing indicator on");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_on"
    };

    this.sendMessage(messageData);
};

/*
 * Turn typing indicator off
 *
 */
FacebookMessageSender.prototype.ssendTypingOff =  function(recipientId) {
    var self = this;
    console.log("Turning typing indicator off");

    var messageData = {
        recipient: {
            id: recipientId
        },
        sender_action: "typing_off"
    };

    this.sendMessage(messageData);
};

/*
 * Send a message with the account linking call-to-action
 *
 */
FacebookMessageSender.prototype.ssendAccountLinking = function(recipientId) {
    var self = this;
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            attachment: {
                type: "template",
                payload: {
                    template_type: "button",
                    text: "Welcome. Link your account.",
                    buttons:[{
                        type: "account_link",
                        url: SERVER_URL + "/authorize"
                    }]
                }
            }
        }
    };

    this.sendMessage(messageData);
};


/*
 * Send a Structured Message (Generic Message type) using the Send API.
 *
 */
FacebookMessageSender.prototype.sendGenericMessage = function(recipientId) {
    var self = this;
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
                        title: "PeterMessageConsumer",
                        subtitle: "Hey, Je suis PeterMessageConsumer. Je suis la pour t'aider à faire tes devoirs",
                        item_url: "https://www.facebook.com/HiPeterMessageConsumerUSA/",
                        image_url: "https://scontent-cdg2-1.xx.fbcdn.net/t31.0-8/13063394_451569781702680_7636515678368653467_o.jpg",
                        buttons: [{
                            type: "postback",
                            payload: "go",
                            title: "Super"
                        },
                        {
                            type: "postback",
                            payload: "how",
                            title: "Comment?"
                        }]
                    }]
                }
            }
        }
    };

    this.sendMessage(messageData);
};

/*
 * Send a text message using the Send API.
 */
FacebookMessageSender.prototype.sendTextMessage = function(recipientId, messageText) {
    var self = this;
    var messageData = {
        recipient: {
            id: recipientId
        },
        message: {
            text: messageText,
        }
    };
    self.sendMessage(messageData);
};


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference#message_delivery
 *
 */
FacebookMessageSender.prototype.receivedDeliveryConfirmation = function(event){
    var self = this;
    var senderId = event.sender.id;
    var recipientId = event.recipient.id;
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
};

