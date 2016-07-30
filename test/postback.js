/**
 * Created by stephen on 27/07/2016.
 */
var test = require('unit.js');
var assert = test.assert;

const
    Message = require('../src/Message.js'),
    FakeMessageSender = require('./FakeMessageSender.js'),
    FacebookMessageSender = require('../src/messageSender/FacebookMessageSender.js'),
    MessageConsumer = require('../src/MessageConsumer/MessageConsumer.js');

var messageData =
{
    "sender": {
        "id": "1017776525008546"
    }
    ,
    "recipient": {
        "id": "1017776525008546"
    }
    ,
    "timestamp": 1469595066596,
    "postback": {
        "payload": "{\"action\": \"self.peter.showIsbn\"}"
    }

};


describe('MessageConsumer', function () {

    it('messageConsumer with fake sender should consume message', function () {
        var consumer = new MessageConsumer();
        var fakeMessageSender = new FakeMessageSender();
        consumer.setMessageSender(fakeMessageSender);
        consumer.consumePostback(messageData);
    });

    it('messageConsumer with facebook sender should consume message', function () {
        var consumer = new MessageConsumer();
        var sender = new FacebookMessageSender();
        consumer.setMessageSender(sender);
        consumer.consumePostback(messageData);
    });

})
;

