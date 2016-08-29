"use strict";

module.exports = LastSequence

const
    History = require("../../History.js"),
    Message = require("../../Message.js"),
    Text = require("../../Text.js"),
    Book = require("../../Book.js");


function LastSequence() {
    var self = this;
    self.book = new Book();
};

LastSequence.prototype.setMessageSender = function (messageSender) {
    var self = this;
    self.messageSender = messageSender;
};

LastSequence.prototype.setNextSequence = function (nextSequence) {
    var self = this;
    self.nextSequence = nextSequence;
};

LastSequence.prototype.run = function (recipientId, message, peter) {
    var self = this;

    if (message.text != undefined && History.get(recipientId).page != "" && History.get(recipientId).ex != "" && History.get(recipientId).isbn != "") {
        History.get(recipientId).lastOutput = '';
        var text = "";
        var url;
        
        text = Text.get("waitPlease");
        self.messageSender.sendMessageData(recipientId, text);

        if (self.book.fileExists(History.get(recipientId).isbn, History.get(recipientId).page, History.get(recipientId).ex)) {
            url = self.book.getTeacherImageUrl(History.get(recipientId).isbn, History.get(recipientId).page, History.get(recipientId).ex);
            History.clear(recipientId);

            self.messageSender.ssendTypingOn(recipientId);
            setTimeout(function () {
                text = Text.get("needMoreTime");
                self.messageSender.sendImageMessage(recipientId, url);
                setTimeout(function () {
                    self.messageSender.sendMessageData(recipientId, Message.get("result_message"));
                },10000);
            }, 5000);
        } else {
            text = Text.get("needMoreTime");
            self.messageSender.ssendTypingOn(recipientId);

            setTimeout(function () {
                self.messageSender.sendTextMessage(recipientId, text);
            }, 5000);
            setTimeout(function () {
                self.nextSequence.speak(recipientId,peter);
            }, 8000);

        }
    }
    if (self.nextSequence != undefined) {
        self.nextSequence.run(recipientId, message, peter);
    }
};

LastSequence.prototype.speak = function (recipientId,peter){
    var self = this;
};
