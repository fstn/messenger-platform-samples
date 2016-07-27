/**
 * Created by stephen on 27/07/2016.
 */
var test = require('unit.js');
var assert = test.assert;

const
Text = require('../src/Text.js');


var text = new Text();

describe('Text', function() {

    it('get() should return text is key is correct', function() {
        var validText = text.get("hello");
        assert(validText.length > 0);
    });

    it('get() should return a different text is key is the same one', function() {
        var validText1 = text.get("hello");
        var validText2 = text.get("hello");
        var validText3 = text.get("hello");
        var validText4 = text.get("hello");
        assert(validText1!=validText2||validText1!=validText3||validText1!=validText4);
    });

    it('get() should return exception is key is incorrect', function() {
        var key = "nonExistentKey";
        try {
            text.get("nonExistentKey");
        } catch (err) {
            assert.equal("UnableToGetTextKeyFor" + key + "Exception", err.message);
        }
    });
});
