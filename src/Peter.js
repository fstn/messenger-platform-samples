module.exports = Peter;

const Text = require("./Text.js"),
    Book = require("./Book.js"),
    Facebook = require("./Facebook.js"),
    MessageModel = require("./model/MessageModel.js"),
    ButtonModel = require("./model/ButtonModel.js"),
    QuickReplyModel = require("./model/QuickReplyModel.js"),
    QuickMessageModel = require("./model/QuickMessageModel.js"),
    JsonDB = require('node-json-db');
;

const IMAGE_URL = "https://webhookpeter.herokuapp.com/static/";


function Peter(){

    this.msg = new Text();
    this.book = new Book();
    this.facebook = new Facebook();

    this.sessions = {};
    this.db = new JsonDB("peter", true, false);

    this.db.push("/users/1017776525008546/books", '[{"isbn":"121313132"},{"isbn":"12312313213"},{"isbn":"12313213123"}]');

}


Peter.prototype.getImageUrl = function(isbn,page,ex) {
    url =   IMAGE_URL + isbn + "/" +isbn+"-"+ this.book.mapping[isbn][page] + ".jpg"
};

Peter.prototype.consumeMessage = function (recipientId,messageText,callBack){
    var text = "";
    var url = undefined;
    this.sessions[recipientId].nbTry++;
    if (this.sessions[recipientId].nbTry >= 2) {
        this.clearSession(recipientId);
        text = this.msg.get("retry");
    } else {

        switch (this.sessions[recipientId].lastOutput) {
            case '':
                var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
                var isbnMatcher = isbnPattern.exec(messageText);
                if (isbnMatcher != null && isbnMatcher.length > 1) {
                    var tmpIsbn = isbnMatcher[1]
                    tmpIsbn = tmpIsbn.replace(/-/g, "");
                    tmpIsbn = tmpIsbn.replace(' ', '');
                    this.sessions[recipientId].isbn = tmpIsbn;
                    console.log("ISBN Number is valid and number is : " + tmpIsbn);
                    this.resetTry(recipientId);
                }
                var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})", "i");
                var pageMatcher = pagePattern.exec(messageText);
                if (pageMatcher != null && pageMatcher.length > 1) {
                    this.sessions[recipientId].page = pageMatcher[1];
                    console.log("Page Number is valid and number is : " + pageMatcher[1]);
                    this.resetTry(recipientId);
                }
                var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})", "i");
                var exMatcher = exPattern.exec(messageText);
                if (exMatcher != null && exMatcher.length > 1) {
                    this.sessions[recipientId].ex = exMatcher[1];
                    console.log("Exercice Number is valid and number is : " + exMatcher[1]);
                    this.resetTry(recipientId);
                }
                break;
            case 'isbn':
                var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
                var isbnMatcher = isbnPattern.exec(messageText);
                if (isbnMatcher != null && isbnMatcher.length > 1) {
                    var tmpIsbn = isbnMatcher[1];
                    tmpIsbn = tmpIsbn.replace(/-/g, "");
                    tmpIsbn = tmpIsbn.replace(' ', '');
                    this.sessions[recipientId].isbn = tmpIsbn;
                    console.log("ISBN Number is valid and number is : " + tmpIsbn);
                    this.resetTry(recipientId);
                }
                break;
            case
            'page'
            :
                var pagePattern = new RegExp("([0-9]{1,3})", "i");
                var pageMatcher = pagePattern.exec(messageText);
                if (pageMatcher != null && pageMatcher.length > 1) {
                    this.sessions[recipientId].page = pageMatcher[1];
                    console.log("Page Number is valid and number is : " + pageMatcher[1]);
                    this.resetTry(recipientId);
                }
                break;
            case
            'ex'
            :
                var exPattern = new RegExp("([0-9]{1,3})", "i");
                var exMatcher = exPattern.exec(messageText);
                if (exMatcher != null && exMatcher.length > 1) {
                    this.sessions[recipientId].ex = exMatcher[1];
                    console.log("Exercice Number is valid and number is : " + exMatcher[1]);
                    this.resetTry(recipientId);
                }
                break;
        }


        if (this.sessions[recipientId].isbn == '') {
            text = this.msg.get("hello")

            text = text.replace("#NAME#", this.sessions[recipientId].user.first_name);

            this.sessions[recipientId].lastOutput = 'isbn';
        } else if (this.sessions[recipientId].page == '') {
            text = this.msg.get("page");
            this.sessions[recipientId].lastOutput = 'page';
        } else if (this.sessions[recipientId].ex == '') {
            text = this.msg.get("exercise");
            this.sessions[recipientId].lastOutput = 'ex';
        } else {
            this.sessions[recipientId].lastOutput = '';
            text = this.msg.get("result");
            text = text.replace("#ISBN#", this.sessions[recipientId].isbn);
            text = text.replace("#PAGE#", this.sessions[recipientId].page);
            text = text.replace("#EX#", this.sessions[recipientId].ex);
            text += this.msg.get("isOk");

            if(this.book.fileExists( this.sessions[recipientId].isbn, this.sessions[recipientId].page, this.sessions[recipientId].ex)) {
                url = this.getImageUrl(this.sessions[recipientId].isbn, this.sessions[recipientId].page, this.sessions[recipientId].ex);
                this.clearSession(recipientId);
            }else{
                text = this.msg.get("fileNotYetAvailable");
                this.clearSession(recipientId);
            }
        }
    }
    callBack(recipientId,text,url);
};

Peter.prototype.resetTry = function(recipientId) {
    if(  this.sessions[recipientId] != undefined) {
        this.sessions[recipientId].nbTry = 0;
    }
};


Peter.prototype.clearSession = function(recipientId) {
    if(this.sessions[recipientId] != undefined ){
        this.sessions[recipientId].isbn = "";
        this.sessions[recipientId].page = "";
        this.sessions[recipientId].ex = "";
        this.sessions[recipientId].lastOutput = "";
        this.sessions[recipientId].nbTry = 0;
    }
};


Peter.prototype.showIsbn = function (recipientId) {
    var self = this;
    var books = JSON.parse(self.db.getData("/users/1017776525008546/books"));

    var quickReplies = [];
    books.forEach(function (book) {
        quickReplies.push(new QuickReplyModel("text", book.isbn, '{"action":peter.setIsbn("'+recipientId+',' + book.isbn + ')}'));
    });
    quickReplies.push(new QuickReplyModel("text", "#addBook#", '{"action":"peter.addIsbn("'+recipientId+')"}'));
    var msgModel = new QuickMessageModel("#chooseBook#", quickReplies);
    self.facebook.sendMessageData('' + recipientId, msgModel);

};


Peter.prototype.setIsbn = function (recipientId,isbn) {
    var self = this;
    text = this.msg.get("page");
    this.sessions[recipientId] = {};
    this.sessions[recipientId].isbn=isbn;
    self.clearSession(recipientId);
    this.sessions[recipientId].lastOutput = 'page';
    self.facebook.sendTextMessage(recipientId,text);
};

Peter.prototype.addIsbn = function (recipientId) {
    var self = this;
    text = this.msg.get("giveIsbn");
    this.sessions[recipientId] = {};
    self.clearSession(recipientId);
    this.sessions[recipientId].lastOutput = 'isbn';
    self.facebook.sendTextMessage(recipientId,text);
};

