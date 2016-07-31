/**
 * Created by stephen on 31/07/2016.
 */
"use strict";

module.exports = LearningSequence

const
    History = require("../../History.js"),
    Message = require("../../Message.js"),
    Text = require("../../Text.js"),
    Book = require("../../Book.js"),
    JsonDB = require('node-json-db');


function LearningSequence() {
    var self = this;
    self.book = new Book();
    self.db = new JsonDB("peter", true, false);
};

LearningSequence.prototype.setMessageSender = function (messageSender) {
    var self = this;
    self.messageSender = messageSender;
};

LearningSequence.prototype.setNextSequence = function (nextSequence) {
    var self = this;
    self.nextSequence = nextSequence;
};



LearningSequence.prototype.run = function (recipientId, message, peter) {
    var self = this;
    var text = "";
    var isbn = History.get(recipientId).isbn;
    var page = History.get(recipientId).page;
    var ex = History.get(recipientId).ex;
    if(message.attachments != undefined && isbn != "" && page != "" && ex != "") {
        message.attachments.forEach(function (attachment) {

            try {
                self.db.getData("/todo/books/" + isbn + "/" + page + "/");
                db.push("/arraytest/myarray[]", {obj: 'test'}, true);
                self.db.push("/todo/books/" + isbn + "/" + page + "/users[]", {"id": recipientId});
                text = Text.get("thanksToHelpMe");
                self.messageSender.sendTextMessage(recipientId, text);
                self.messageSender.sendGifMessage(recipientId, "https://media.giphy.com/media/LkjlH3rVETgsg/giphy.gif")
            } catch (error) {
                /**
                 * This book and page is already present in to do list, just add to put user information
                 */
                if (error.message.startsWith("Can't find dataPath:")) {
                    self.db.push("/todo/books/" + isbn + "/" + page, {
                        "users": [{"id": recipientId}],
                        "teacher": {"isbn": "", "page": ""}
                    });
                    text = Text.get("thanksToHelpMe");
                    self.messageSender.sendTextMessage(recipientId, text);
                    self.messageSender.sendGifMessage(recipientId, "https://media.giphy.com/media/LkjlH3rVETgsg/giphy.gif")
                } else {
                    throw error;
                }
            }
            History.clear(recipientId);
            return;
        })
    }
    if (self.nextSequence != undefined) {
        self.nextSequence.run(recipientId, message, peter);
    }
};

LearningSequence.prototype.speak = function (recipientId,peter){
    var self = this;
    var text = Text.get("learnMe");
    self.messageSender.sendTextMessage(recipientId,text);
};

