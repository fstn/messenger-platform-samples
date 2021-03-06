"use strict";

module.exports = ExSequence

const
    History = require("../../History.js"),
    Message = require("../../Message.js"),
    Text = require("../../Text.js");

function ExSequence() {
    var self = this;
};

ExSequence.prototype.setMessageSender = function (messageSender) {
    var self = this;
    self.messageSender = messageSender;
};

ExSequence.prototype.setNextSequence = function (nextSequence) {
    var self = this;
    self.nextSequence = nextSequence;
};

ExSequence.prototype.run = function (recipientId, message, peter) {
    var self = this;
    var text = "";
    if (History.get(recipientId).ex == "") {
        var exPattern = new RegExp("([0-9]{1,3})", "i");
        var exMatcher = exPattern.exec(message.text);
        if (exMatcher != null && exMatcher.length > 1) {
            History.get(recipientId).ex = exMatcher[1];
            console.log("Exercice Number is valid and number is : " + exMatcher[1]);
            History.resetTry(recipientId);
            if (self.nextSequence != undefined) {
                self.nextSequence.speak(recipientId, peter);
            }
        }else{
            self.speak(recipientId, peter);
            return;
        }
    }

    if (self.nextSequence != undefined) {
        self.nextSequence.run(recipientId, message, peter);
    }
};

ExSequence.prototype.speak = function (recipientId,peter){
    var self = this;
    var text = Text.get("exercise");
    self.messageSender.sendTextMessage(recipientId, text);
};
