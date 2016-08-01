/**
 * Created by stephen on 01/08/2016.
 */
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
        "id": "1017776525008546"
    }
    ,
    "recipient": {
        "id": "451567701702888"
    }
    ,
    "timestamp": 1469595066596,
    "message": {"mid": "mid.1467661761380:6e08038d213c268f13", "seq": 146, "text": "Bonjour"}
};

var sender = new FacebookMessageSender();
var consumer = new MessageConsumer(sender);
var iaConsumer = new IAMessageConsumer(sender);
sender.sendTextMessage(1017776525008546, "###########################################################################################################################################################################################################################################");

setTimeout(function () {
    sender.sendTextMessage(1017776525008546, "echo helloMessageData");
    consumer.consumeMessage(helloMessageData)
}, 2000);

/*
 consumer.consumeMessage(firstMessageData);
 setTimeout(function () {
 consumer.consumeMessage(imageMessageData);
 }, 3000);*/