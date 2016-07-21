module.exports = Peter;

const Text = require("./Text.js"),
    Book = require("./Book.js");

const IMAGE_URL = "https://webhookpeter.herokuapp.com/static/";


function Peter(){
    var self = this;

    self.msg = new Text();
    self.book = new Book();

    self.sessions = {};

}

Peter.prototype.getImageUrl = function(isbn,page,ex) {
    url =   IMAGE_URL + isbn + "/" +isbn+"-"+ self.book.mapping[isbn][page] + ".jpg"
};

Peter.prototype.consumeMessage = function (recipientId,messageText,callBack){
    var text = "";
    self.sessions[recipientId].nbTry++;
    if (self.sessions[recipientId].nbTry >= 2) {
        self.clearSession(recipientId);
        text = self.msg.get("retry").sort(function () {
            return Math.random() - 0.5;
        })[0];
    } else {

        switch (self.sessions[recipientId].lastOutput) {
            case '':
                var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
                var isbnMatcher = isbnPattern.exec(messageText);
                if (isbnMatcher != null && isbnMatcher.length > 1) {
                    var tmpIsbn = isbnMatcher[1]
                    tmpIsbn = tmpIsbn.replace(/-/g, "");
                    tmpIsbn = tmpIsbn.replace(' ', '');
                    self.sessions[recipientId].isbn = tmpIsbn;
                    console.log("ISBN Number is valid and number is : " + tmpIsbn);
                    self.sessions[recipientId].nbTry = 0;
                }
                var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})", "i");
                var pageMatcher = pagePattern.exec(messageText);
                if (pageMatcher != null && pageMatcher.length > 1) {
                    self.sessions[recipientId].page = pageMatcher[1];
                    console.log("Page Number is valid and number is : " + pageMatcher[1]);
                    self.sessions[recipientId].nbTry = 0;
                }
                var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})", "i");
                var exMatcher = exPattern.exec(messageText);
                if (exMatcher != null && exMatcher.length > 1) {
                    self.sessions[recipientId].ex = exMatcher[1];
                    console.log("Exercice Number is valid and number is : " + exMatcher[1]);
                    self.sessions[recipientId].nbTry = 0;
                }
                break;
            case 'isbn':
                var isbnPattern = new RegExp("((?:[0-9]-?){10,20})", "i");
                var isbnMatcher = isbnPattern.exec(messageText);
                if (isbnMatcher != null && isbnMatcher.length > 1) {
                    var tmpIsbn = isbnMatcher[1];
                    tmpIsbn = tmpIsbn.replace(/-/g, "");
                    tmpIsbn = tmpIsbn.replace(' ', '');
                    self.sessions[recipientId].isbn = tmpIsbn;
                    console.log("ISBN Number is valid and number is : " + tmpIsbn);
                    self.sessions[recipientId].nbTry = 0;
                }
                break;
            case
            'page'
            :
                var pagePattern = new RegExp("([0-9]{1,3})", "i");
                var pageMatcher = pagePattern.exec(messageText);
                if (pageMatcher != null && pageMatcher.length > 1) {
                    self.sessions[recipientId].page = pageMatcher[1];
                    console.log("Page Number is valid and number is : " + pageMatcher[1]);
                    self.sessions[recipientId].nbTry = 0;
                }
                break;
            case
            'ex'
            :
                var exPattern = new RegExp("([0-9]{1,3})", "i");
                var exMatcher = exPattern.exec(messageText);
                if (exMatcher != null && exMatcher.length > 1) {
                    self.sessions[recipientId].ex = exMatcher[1];
                    console.log("Exercice Number is valid and number is : " + exMatcher[1]);
                    self.sessions[recipientId].nbTry = 0;
                }
                break;
        }


        if (sessions[recipientId].isbn == '') {
            text = self.msg.get("hello")

            text = text.replace("#NAME#", sessions[recipientId].user.first_name);

            self.sessions[recipientId].lastOutput = 'isbn';
        } else if (self.sessions[recipientId].page == '') {
            text = self.msg.get("page");
            self.sessions[recipientId].lastOutput = 'page';
        } else if (self.sessions[recipientId].ex == '') {
            text = self.msg.get("exercise");
            self.sessions[recipientId].lastOutput = 'ex';
        } else {
            self.sessions[recipientId].lastOutput = '';
            text = msg.self.msg.get("result");
            text = text.replace("#ISBN#", self.sessions[recipientId].isbn);
            text = text.replace("#PAGE#", self.sessions[recipientId].page);
            text = text.replace("#EX#", self.sessions[recipientId].ex);
            text += self.msg.get("isOk");

            if(fileExists( self.sessions[recipientId].isbn, sself.essions[recipientId].page, self.sessions[recipientId].ex)) {
                self.sendImageMessage(recipientId,url , self.sessions[recipientId].isbn, self.sessions[recipientId].page, self.sessions[recipientId].ex)
                self.clearSession(recipientId);
            }else{
                text = self.msg.get("fileNotYetAvailable");
            }
        }
    }
};

Peter.prototype.clearSession = function(recipientId) {
    if(self.sessions[recipientId] != undefined ){
        self.sessions[recipientId].isbn = "";
        self.sessions[recipientId].page = "";
        self.sessions[recipientId].ex = "";
        self.sessions[recipientId].lastOutput = "";
        self.sessions[recipientId].nbTry = 0;
    }
}