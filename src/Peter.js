module.exports = Peter;

const Text = require("./Text.js"),
    Book = require("./Book.js"),
    Facebook = require("./Facebook.js"),
    History = require("./History.js"),
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

    History.clear();
    this.db = new JsonDB("peter", true, false);

    this.db.push("/users/1017776525008546/books", '[{"isbn":"121313132"},{"isbn":"12312313213"},{"isbn":"12313213123"}]');

}


Peter.prototype.getImageUrl = function(isbn,page,ex) {
    url =   IMAGE_URL + isbn + "/" +isbn+"-"+ this.book.mapping[isbn][page] + ".jpg"
};


Peter.prototype.consumeMessage = function (recipientId,messageText,callBack){
    var self = this;
    var text = "";
    var url = undefined;
    History.get(recipientId).nbTry++;
    if (History.get(recipientId).nbTry >= 2) {
        History.clear(recipientId);
        text = this.msg.get("retry");
    } else {

        switch (History.get(recipientId).lastOutput) {
            case '':
                var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
                var isbnMatcher = isbnPattern.exec(messageText);
                if (isbnMatcher != null && isbnMatcher.length > 1) {
                    var tmpIsbn = isbnMatcher[1]
                    tmpIsbn = tmpIsbn.replace(/-/g, "");
                    tmpIsbn = tmpIsbn.replace(' ', '');
                    History.get(recipientId).isbn = tmpIsbn;
                    console.log("ISBN Number is valid and number is : " + tmpIsbn);
                    this.resetTry(recipientId);
                }
                var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})", "i");
                var pageMatcher = pagePattern.exec(messageText);
                if (pageMatcher != null && pageMatcher.length > 1) {
                    History.get(recipientId).page = pageMatcher[1];
                    console.log("Page Number is valid and number is : " + pageMatcher[1]);
                    this.resetTry(recipientId);
                }
                var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})", "i");
                var exMatcher = exPattern.exec(messageText);
                if (exMatcher != null && exMatcher.length > 1) {
                    History.get(recipientId).ex = exMatcher[1];
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
                    History.get(recipientId).isbn = tmpIsbn;
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
                    History.get(recipientId).page = pageMatcher[1];
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
                    History.get(recipientId).ex = exMatcher[1];
                    console.log("Exercice Number is valid and number is : " + exMatcher[1]);
                    this.resetTry(recipientId);
                }
                break;
        }


        if (History.get(recipientId).isbn == '') {
            text = this.msg.get("hello")

            //TODO text = text.replace("#NAME#", History.get(recipientId).user.first_name);

            History.get(recipientId).lastOutput = 'isbn';
            callBack(recipientId,text,url);
        } else if (History.get(recipientId).page == '') {
            text = this.msg.get("page");
            History.get(recipientId).lastOutput = 'page';
            callBack(recipientId,text,url);
        } else if (History.get(recipientId).ex == '') {
            text = this.msg.get("exercise");
            History.get(recipientId).lastOutput = 'ex';
            callBack(recipientId,text,url);
        } else {
            History.get(recipientId).lastOutput = '';
            text = this.msg.get("result");
            text = text.replace("#ISBN#", History.get(recipientId).isbn);
            text = text.replace("#PAGE#", History.get(recipientId).page);
            text = text.replace("#EX#", History.get(recipientId).ex);
            text += this.msg.get("isOk");

            text = this.msg.get("waitPlease");
            History.clear(recipientId);

           if(this.book.fileExists( History.get(recipientId).isbn, History.get(recipientId).page, History.get(recipientId).ex)) {
                url = this.getImageUrl(History.get(recipientId).isbn, History.get(recipientId).page, History.get(recipientId).ex);
                History.clear(recipientId);

                self.facebook.ssendTypingOn();
                setTimeout(function(){self.facebook.ssendTypingOff()},2000);
                setTimeout(function(){callBack(recipientId,text,url);},5000);
            }else{
               text = this.msg.get("needMoreTime");
               History.clear(recipientId);
               self.facebook.ssendTypingOn();
               setTimeout(function(){self.facebook.ssendTypingOff()},2000);
               setTimeout(function(){callBack(recipientId,text,url);self.startLearning(recipientId,History.get(recipientId).isbn, History.get(recipientId).page, History.get(recipientId).ex),callBack},6000);
            }
        }
    }
};

Peter.prototype.resetTry = function(recipientId) {
    if(  History.get(recipientId) != undefined) {
        History.get(recipientId).nbTry = 0;
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
    History.clear(recipientId);
    History.get(recipientId).isbn=isbn;
    History.get(recipientId).lastOutput = 'page';
    self.facebook.sendTextMessage(recipientId,text);
};

Peter.prototype.addIsbn = function (recipientId) {
    var self = this;
    text = this.msg.get("giveIsbn");
    History.clear(recipientId);
    History.get(recipientId).lastOutput = 'isbn';
    self.facebook.sendTextMessage(recipientId,text);
};

Peter.prototype.startLearning = function(recipientId,isbn,page,ex,callBack){
    var self = this;
    text = this.msg.get("learnMe");
    callBack(recipientId,text,'')


};
