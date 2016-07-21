module.exports = Facebook;

const
    config = require('config'),
    crypto = require('crypto'),
    request = require('request');

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

function Facebook(){
    if (!(APP_SECRET && VALIDATION_TOKEN && PAGE_ACCESS_TOKEN)) {
        console.error("Missing config values");
        process.exit(1);
    }
}

Facebook.prototype.verifyToken = function(req,res) {
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
 * Verify that the callback came from Facebook. Using the App Secret from
 * the App Dashboard, we can verify the signature that is sent with each
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
Facebook.prototype.verifyRequestSignature= function(req, res, buf) {

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
Facebook.prototype.sendImageMessage= function(senderId,url) {
    var messageData = {
        recipient: {
            id: sender
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

    callSendAPI(messageData);
};




Facebook.prototype.getUserData = function(senderId,callBack){
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
Facebook.prototype.callSendAPI = function (messageData) {
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
};


/*
 * Delivery Confirmation Event
 *
 * This event is sent to confirm the delivery of a message. Read more about
 * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference#message_delivery
 *
 */
Facebook.prototype.receivedDeliveryConfirmation = function(event){
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
};
