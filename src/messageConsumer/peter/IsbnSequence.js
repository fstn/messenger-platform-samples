"use strict";

module.exports = IsbnSequence

const
    History = require("../../History.js"),
    Message = require("../../Message.js"),
    Text = require("../../Text.js");

function IsbnSequence() {
    var self = this;
};

IsbnSequence.prototype.setMessageSender = function (messageSender) {
    var self = this;
    self.messageSender = messageSender;
};

IsbnSequence.prototype.setNextSequence = function (nextSequence) {
    var self = this;
    self.nextSequence = nextSequence;
};

IsbnSequence.prototype.run = function (recipientId, messageText, peter) {
    var self = this;
    var text = "";
    if (History.get(recipientId).isbn == "") {
        var
            isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
        var isbnMatcher = isbnPattern.exec(messageText);
        if (isbnMatcher != null && isbnMatcher.length > 1) {
            var tmpIsbn = isbnMatcher[1];
            tmpIsbn = tmpIsbn.replace(/-/g, "");
            tmpIsbn = tmpIsbn.replace(' ', '');
            History.get(recipientId).isbn = tmpIsbn;
            console.log("ISBN Number is valid and number is : " + tmpIsbn);
            History.resetTry(recipientId);
            if (self.nextSequence != undefined) {
                self.nextSequence.speak(recipientId,peter);
            }
            //TODO text = text.replace("#NAME#", History.get(recipientId).user.first_name);

            History.get(recipientId).lastOutput = 'isbn';
            return;
        }
    }
    if (self.nextSequence != undefined) {
        self.nextSequence.run(recipientId, messageText, peter);
    }
};

IsbnSequence.prototype.speak = function (recipientId,peter){
    var text = Text.get("hello");
    self.messageSender.sendTextMessage(recipientId, text);
};
