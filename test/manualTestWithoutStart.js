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
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "1235986598569"}
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

var imageMessageData =
{
    "sender": {
        "id": "1321371367881031"
    }
    ,
    "recipient": {
        "id": "513588365516126"
    }
    ,
    "timestamp": 1469872505392,
    "message": {
        "mid": "mid.1469872505278:18abfbb1a3904b5e93",
        "seq": 2801,
        "attachments": [{
        "type": "image",
        "payload": {"url": "https://scontent-cdg2-1.xx.fbcdn.net/v/t34.0-12/13875059_10209270593189330_1796345470_n.png?oh=802478bac95a3f49f23344590d84bca4&oe=579FEA49"}
    }]
}
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
    sender.sendTextMessage(1321371367881031, "echo imageMessageData");
    consumer.consumeMessage(imageMessageData)
}, 12000);

/*
consumer.consumeMessage(firstMessageData);
setTimeout(function () {
    consumer.consumeMessage(imageMessageData);
}, 3000);*/