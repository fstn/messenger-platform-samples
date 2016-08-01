"use strict";

module.exports = InitSequence

const
    History = require("../../History.js"),
    Message = require("../../Message.js"),
    Text = require("../../Text.js");

function InitSequence() {
    var self = this;
};

InitSequence.prototype.setMessageSender = function (messageSender) {
    var self = this;
    self.messageSender = messageSender;
};

InitSequence.prototype.setNextSequence = function(nextSequence){
    var self = this;
    self.nextSequence = nextSequence;
};

InitSequence.prototype.run = function (recipientId, message, peter) {
    var self = this;
    var text = "";
    var match = false;
    if (message.text != undefined && (message.text.indexOf("reset")!=-1||message.text.indexOf("start")!=-1||message.text.indexOf("commence")!=-1||message.text.indexOf("commencer")!=-1)) {
        History.clear(recipientId);
        self.messageSender.sendMessageData(recipientId, Message.get("welcome_message"));
        return;
    }
    if (message.text != undefined ) {
        var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
        var isbnMatcher = isbnPattern.exec(message.text);
        if (isbnMatcher != null && isbnMatcher.length > 1) {
            var tmpIsbn = isbnMatcher[1];
            message.text = message.text.replace(isbnMatcher[1],"");
            tmpIsbn = tmpIsbn.replace(/-/g, "");
            tmpIsbn = tmpIsbn.replace(' ', '');
            History.get(recipientId).isbn = tmpIsbn;
            console.log("ISBN Number is valid and number is : " + tmpIsbn);
            History.resetTry(recipientId);
            match = true;
        }
        var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})", "i");
        var pageMatcher = pagePattern.exec(message.text);
        if (pageMatcher != null && pageMatcher.length > 1) {
            message.text = message.text.replace(pageMatcher[1],"");
            History.get(recipientId).page = pageMatcher[1];
            console.log("Page Number is valid and number is : " + pageMatcher[1]);
            History.resetTry(recipientId);
            match = true;
        }else{
            match = false;
        }
        var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})", "i");
        var exMatcher = exPattern.exec(message.text);
        if (exMatcher != null && exMatcher.length > 1) {
            message.text = message.text.replace(exMatcher[1],"");
            History.get(recipientId).ex = exMatcher[1];
            console.log("Exercice Number is valid and number is : " + exMatcher[1]);
            History.resetTry(recipientId);
            match = true;
        }else{
            match = false;
        }
        if (
            match == true) {
            return;
        }
    }
    if (self.nextSequence != undefined) {
        self.nextSequence.run(recipientId, message, peter);
    }
};
