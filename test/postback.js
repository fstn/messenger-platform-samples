/**
 * Created by stephen on 27/07/2016.
 */
var test = require('unit.js');
var assert = test.assert;

const
    Message = require('../src/Message.js'),
    MessageConsumer = require('../src/MessageConsumer.js');

describe('MessageConsumer', function () {

    it('messageConsumer should consume message', function () {
        var consumer = new MessageConsumer();
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
                "payload": {
                    "action": "self.peter.showIsbn"
                }
            }

        };
        consumer.consumePostback(messageData);
    })
})
;

