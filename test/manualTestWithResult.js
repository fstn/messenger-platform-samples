/**
 * Created by stephen on 30/07/2016.
 */


/* jshint node: true, devel: true */
'use strict';


const
    Message = require('../src/Message.js'),
    FakeMessageSender = require('./FakeMessageSender.js'),
    FacebookMessageSender = require('../src/messageSender/FacebookMessageSender.js'),
    MessageConsumer = require('../src/messageConsumer/MessageConsumer.js'),
    IAMessageConsumer = require('../src/messageConsumer/IAMessageConsumer.js');


var helloMessageData =
{
    "sender": {
        "id": "1321371367881031"
    }
    ,
    "recipient": {
        "id": "513588365516126"
    }
    ,
    "timestamp": 1469595066596,
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "Bonjour"}
};

var isbnMessageData =
{
    "sender": {
        "id": "1321371367881031"
    }
    ,
    "recipient": {
        "id": "513588365516126"
    }
    ,
    "timestamp": 1469595066596,
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "9782218962004"}
};

var pageMessageData =
{
    "sender": {
        "id": "1321371367881031"
    }
    ,
    "recipient": {
        "id": "513588365516126"
    }
    ,
    "timestamp": 1469595066596,
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "22"}
};

var exMessageData =
{
    "sender": {
        "id": "1321371367881031"
    }
    ,
    "recipient": {
        "id": "513588365516126"
    }
    ,
    "timestamp": 1469595066596,
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "12"}
};

var yesMessageData =
{
    "sender": {"id": "1321371367881031"},
    "recipient": {
        "id": "513588365516126"
    }
    ,
    "postback": {"payload": "{\"message\":\"seeYouSoon_message\"}"}
};

var noMessageData =
{
    "sender": {"id": "1321371367881031"},
    "recipient": {
        "id": "513588365516126"
    }
    ,
    "postback": {"payload": "{\"message\":\"howCanIHelpYou_message\"}"}
};

var sender = new FacebookMessageSender();
var consumer = new MessageConsumer(sender);
var iaConsumer = new IAMessageConsumer(sender);
sender.sendTextMessage(1321371367881031, "###########################################################################################################################################################################################################################################");

setTimeout(function () {
    sender.sendTextMessage(1321371367881031, "echo helloMessageData");
    consumer.consumeMessage(helloMessageData)
}, 2000);

setTimeout(function () {
    sender.sendTextMessage(1321371367881031, "echo isbnMessageData");
    consumer.consumeMessage(isbnMessageData)
}, 3000);

setTimeout(function () {
    sender.sendTextMessage(1321371367881031, "echo pageMessageData");
    consumer.consumeMessage(pageMessageData)
}, 4000);
setTimeout(function () {
    sender.sendTextMessage(1321371367881031, "echo exMessageData");
    consumer.consumeMessage(exMessageData)
}, 5000);

setTimeout(function () {
    sender.sendTextMessage(1321371367881031, "echo yesMessageData");
    consumer.consumePostback(noMessageData)
}, 5200);
