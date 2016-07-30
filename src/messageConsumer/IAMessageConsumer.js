"use strict";

module.exports = IAMessageConsumer;

const
    config = require('config'),
    request = require('request'),
    apiai = require('apiai'),
    History = require("../History.js");


// App Secret can be retrieved from the App Dashboard
const APP_APIAP = (process.env.MESSENGER_APP_SECRET) ?
    process.env.MESSENGER_APP_SECRET :
    config.get('apiaiKey');


function IAMessageConsumer (){
    var self = this;
}

IAMessageConsumer.prototype.setNextConsumer = function (nextConsumer){
    var self = this;
    self.nextConsumer = nextConsumer;
};

IAMessageConsumer.prototype.setMessageSender = function (messageSender){
    var self = this;
    self.messageSender = messageSender;
};

IAMessageConsumer.prototype.consumeMessage = function (recipientId, message) {
    var self = this;
    if(message != undefined && message.text != undefined) {

        var aiapi = apiai(APP_APIAP);
        aiapi.language = "FR";
        var request = aiapi.textRequest(message.text);

        request.on('response', function (response) {
            console.log(response);
            var speech = response.result.fulfillment.speech;
            if (speech != "") {
                History.resetTry(recipientId);
                self.messageSender.sendTextMessage(recipientId, speech);
            } else {
                if (self.nextConsumer != undefined) {
                    self.nextConsumer.consumeMessage(recipientId, message);
                }
            }
        });

        request.on('error', function (error) {
            console.log(error);
        });

        request.end()
    }else{
        if (self.nextConsumer != undefined) {
            self.nextConsumer.consumeMessage(recipientId, message);
        }
    }


}