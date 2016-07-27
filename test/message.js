/**
 * Created by stephen on 27/07/2016.
 */
var test = require('unit.js');
var assert = test.assert;

const
Message = require('../src/Message.js');


var msg = new Message();

describe('Message', function() {

    it('get() should return msg is key is correct', function() {
        var validMessage = msg.get("welcome_message");

        assert(validMessage.attachment.payload.elements["0"].buttons["0"].title.length > 0);
    });

    it('get() should return a different text is key is the same one', function() {
        var validText1 = msg.get("welcome_message");
        var validText2 = msg.get("welcome_message");
        var validText3 = msg.get("welcome_message");
        var validText4 = msg.get("welcome_message");
        assert(validText1!=validText2||validText1!=validText3||validText1!=validText4);
    });


    it('get() should return exception is key is incorrect', function() {
        var key = "nonExistentKey";
        try {
            msg.get("nonExistentKey");
        } catch (err) {
            assert.equal("UnableToGetMessageKeyFor" + key + "Exception", err.message);
        }
    });
});
