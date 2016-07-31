"use strict";

module.exports = PageSequence

const
    History = require("../../History.js"),
    Message = require("../../Message.js"),
    Text = require("../../Text.js");

function PageSequence() {
};

PageSequence.prototype.setMessageSender = function (messageSender) {
    var self = this;
    self.messageSender = messageSender;
};

PageSequence.prototype.setNextSequence = function (nextSequence) {
    var self = this;
    self.nextSequence = nextSequence;
};

PageSequence.prototype.run = function (recipientId, message, peter) {
    var self = this;
    var text = "";
    if (History.get(recipientId).page == "") {
        var pagePattern = new RegExp("([0-9]{1,3})", "i");
        var pageMatcher = pagePattern.exec(message.text);
        if (pageMatcher != null && pageMatcher.length > 1) {
            History.get(recipientId).page = pageMatcher[1];
            console.log("Page Number is valid and number is : " + pageMatcher[1]);
            History.resetTry(recipientId);
            if (self.nextSequence != undefined) {
                self.nextSequence.speak(recipientId,peter);
            }
            return;
        }
    }
    if (self.nextSequence != undefined) {
        self.nextSequence.run(recipientId, message, peter);
    }
};

PageSequence.prototype.speak = function (recipientId,peter){
    var self = this;
    var text = Text.get("page");
    self.messageSender.sendTextMessage(recipientId, text);
};
