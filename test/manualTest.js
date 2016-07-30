/**
 * Created by stephen on 30/07/2016.
 */


/* jshint node: true, devel: true */
'use strict';


const
    Message = require('../src/Message.js'),
    FakeMessageSender = require('./FakeMessageSender.js'),
    FacebookMessageSender = require('../src/messageSender/FacebookMessageSender.js'),
    MessageConsumer = require('../src/MessageConsumer/MessageConsumer.js');


var firstMessageData =
{
    "sender": {
        "id": "1017776525008546"
    }
    ,
    "recipient": {
        "id": "451567701702888"
    }
    ,
    "timestamp": 1469595066596,
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "hey"}
};

var startMessageData =
{
    "sender": {
        "id": "1017776525008546"
    }
    ,
    "recipient": {
        "id": "451567701702888"
    }
    ,
    "timestamp": 1469595066596,
    "postback": {"payload": "{\"action\":\"self.start(senderId)\"}"}
};

var isbnMessageData =
{
    "sender": {
        "id": "1017776525008546"
    }
    ,
    "recipient": {
        "id": "451567701702888"
    }
    ,
    "timestamp": 1469595066596,
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "1235986598569"}
};

var pageMessageData =
{
    "sender": {
        "id": "1017776525008546"
    }
    ,
    "recipient": {
        "id": "451567701702888"
    }
    ,
    "timestamp": 1469595066596,
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "22"}
};

var exMessageData =
{
    "sender": {
        "id": "1017776525008546"
    }
    ,
    "recipient": {
        "id": "451567701702888"
    }
    ,
    "timestamp": 1469595066596,
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "12"}
};

var imageMessageData =
{
    "sender": {
        "id": "1017776525008546"
    }
    ,
    "recipient": {
        "id": "451567701702888"
    }
    ,
    "timestamp": 1469872505392, "message": {
    "mid": "mid.1469872505278:18abfbb1a3904b5e93", "seq": 2801, "attachments": [{
        "type": "image",
        "payload": {"url": "https://scontent.xx.fbcdn.net/v/t35.0-12/13682547_10209260646700674_1328638499_o.png?_nc_ad=z-m&oh=bce8c12056120defad3597ef5c831a49&oe=579DF0D9"}
    }]
}
};


var sender = new FacebookMessageSender();
var consumer = new MessageConsumer(sender);
sender.sendTextMessage(1017776525008546, "###########################################################################################################################################################################################################################################");

setTimeout(function () {
    consumer.consumeMessage(firstMessageData)
}, 1000);
setTimeout(function () {
    consumer.consumePostback(startMessageData)
}, 2000);
setTimeout(function () {
    consumer.consumeMessage(isbnMessageData)
}, 3000);
setTimeout(function () {
    consumer.consumeMessage(pageMessageData)
}, 4000);
setTimeout(function () {
    consumer.consumeMessage(exMessageData)
}, 7000);
setTimeout(function () {
    consumer.consumeMessage(imageMessageData)
}, 21000);