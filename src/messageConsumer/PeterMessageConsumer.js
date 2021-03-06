"use strict";

module.exports = PeterMessageConsumer;


const Text = require("../Text.js"),
    Book = require("../Book.js"),
    FacebookMessageSender = require("../messageSender/FacebookMessageSender.js"),
    History = require("../History.js"),
    MessageModel = require("../model/MessageModel.js"),
    ButtonModel = require("../model/ButtonModel.js"),
    QuickReplyModel = require("../model/QuickReplyModel.js"),
    QuickMessageModel = require("../model/QuickMessageModel.js"),
    InitSequence = require("./peter/InitSequence.js"),
    IsbnSequence = require("./peter/IsbnSequence.js"),
    PageSequence = require("./peter/PageSequence.js"),
    ExSequence = require("./peter/ExSequence.js"),
    LastSequence = require("./peter/LastSequence.js"),
    LearningSequence = require("./peter/LearningSequence.js"),
    JsonDB = require('node-json-db');
;


function PeterMessageConsumer(){

    this.book = new Book();
    this.messageSender = {};

    History.clear();
    this.db = new JsonDB("peter", true, false);


    this.learningSequence = new LearningSequence();
    this.lastSequence = new LastSequence();
    this.lastSequence.setNextSequence(this.learningSequence);
    this.exSequence = new ExSequence();
    this.exSequence.setNextSequence(this.lastSequence);
    this.pageSequence = new PageSequence();
    this.pageSequence.setNextSequence(this.exSequence);
    this.isbnSequence = new IsbnSequence();
    this.isbnSequence.setNextSequence(this.pageSequence);
    this.initSequence = new InitSequence();
    this.initSequence.setNextSequence(this.isbnSequence);

}



PeterMessageConsumer.prototype.setNextConsumer = function (nextConsumer){
    var self = this;
    self.nextConsumer = nextConsumer;
};

PeterMessageConsumer.prototype.setMessageSender = function (messageSender){
    var self = this;
    self.messageSender = messageSender;
    self.initSequence.setMessageSender(messageSender);
    self.isbnSequence.setMessageSender(messageSender);
    self.pageSequence.setMessageSender(messageSender);
    self.exSequence.setMessageSender(messageSender);
    self.lastSequence.setMessageSender(messageSender);
    self.learningSequence.setMessageSender(messageSender);
};

PeterMessageConsumer.prototype.consumeMessage = function (recipientId,message){
    var self = this;
    var text = "";
    var url = undefined;
    History.get(recipientId).nbTry++;
    if (History.get(recipientId).nbTry >= 4) {
        History.clear(recipientId);
        text = Text.get("retry");
        self.messageSender.sendTextMessage(recipientId, text);
    }
    this.initSequence.run(recipientId, message, self);

};


PeterMessageConsumer.prototype.showIsbn = function (recipientId) {
    var self = this;
    var books = JSON.parse(self.db.getData("/users/1017776525008546/books"));

    var quickReplies = [];
    books.forEach(function (book) {
        quickReplies.push(new QuickReplyModel("text", book.isbn, '{"action":peter.setIsbn("'+recipientId+',' + book.isbn + ')}'));
    });
    quickReplies.push(new QuickReplyModel("text", "#addBook#", '{"action":"peter.addIsbn("'+recipientId+')"}'));
    var msgModel = new QuickMessageModel("#chooseBook#", quickReplies);
    self.messageSender.sendMessageData('' + recipientId, msgModel);

};


PeterMessageConsumer.prototype.setIsbn = function (recipientId,isbn) {
    var self = this;
    text = this.msg.get("page");
    History.clear(recipientId);
    History.get(recipientId).isbn=isbn;
    History.get(recipientId).lastOutput = 'page';
    self.messageSender.sendTextMessage(recipientId,text);
};

PeterMessageConsumer.prototype.addIsbn = function (recipientId) {
    var self = this;
    text = this.msg.get("giveIsbn");
    History.clear(recipientId);
    History.get(recipientId).lastOutput = 'isbn';
    self.messageSender.sendTextMessage(recipientId,text);
};

