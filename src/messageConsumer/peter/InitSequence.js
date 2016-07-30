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

InitSequence.prototype.run = function(recipientId,messageText, peter){
    var self = this;
    var text = "";
   /* if (History.get(recipientId).lastOutput == 'page') {
        var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
        var isbnMatcher = isbnPattern.exec(messageText);
        if (isbnMatcher != null && isbnMatcher.length > 1) {
            var tmpIsbn = isbnMatcher[1]
            tmpIsbn = tmpIsbn.replace(/-/g, "");
            tmpIsbn = tmpIsbn.replace(' ', '');
            History.get(recipientId).isbn = tmpIsbn;
            console.log("ISBN Number is valid and number is : " + tmpIsbn);
            History.resetTry(recipientId);
        }
        var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})", "i");
        var pageMatcher = pagePattern.exec(messageText);
        if (pageMatcher != null && pageMatcher.length > 1) {
            History.get(recipientId).page = pageMatcher[1];
            console.log("Page Number is valid and number is : " + pageMatcher[1]);
            History.resetTry(recipientId);
        }
        var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})", "i");
        var exMatcher = exPattern.exec(messageText);
        if (exMatcher != null && exMatcher.length > 1) {
            History.get(recipientId).ex = exMatcher[1];
            console.log("Exercice Number is valid and number is : " + exMatcher[1]);
            History.resetTry(recipientId);
        }
    }else{*/
        if( self.nextSequence != undefined) {
            self.nextSequence.run(recipientId, messageText, peter);
        }
    //}
};
