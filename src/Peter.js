module.exports = Peter;

const Text = require("./Text.js"),
    Book = require("./Book.js");

const IMAGE_URL = "https://webhookpeter.herokuapp.com/static/";


function Peter(){

    this.msg = new Text();
    this.book = new Book();

    this.sessions = {};

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
                    this.sessions[recipientId].nbTry = 0;
                }
                var pagePattern = new RegExp("(?:(?:page)|(?:p)|(?:P))[^0-9]*([0-9]{1,3})", "i");
                var pageMatcher = pagePattern.exec(messageText);
                if (pageMatcher != null && pageMatcher.length > 1) {
                    this.sessions[recipientId].page = pageMatcher[1];
                    console.log("Page Number is valid and number is : " + pageMatcher[1]);
                    this.sessions[recipientId].nbTry = 0;
                }
                var exPattern = new RegExp("(?:(?:ex)|(?:Ex)|(?:exo)|(?:Exo)|(?:Exercice))[^0-9]*([0-9]{1,3})", "i");
                var exMatcher = exPattern.exec(messageText);
                if (exMatcher != null && exMatcher.length > 1) {
                    this.sessions[recipientId].ex = exMatcher[1];
                    console.log("Exercice Number is valid and number is : " + exMatcher[1]);
                    this.sessions[recipientId].nbTry = 0;
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
                    this.sessions[recipientId].nbTry = 0;
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
                    this.sessions[recipientId].nbTry = 0;
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
                    this.sessions[recipientId].nbTry = 0;
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
            text = msg.this.msg.get("result");
            text = text.replace("#ISBN#", this.sessions[recipientId].isbn);
            text = text.replace("#PAGE#", this.sessions[recipientId].page);
            text = text.replace("#EX#", this.sessions[recipientId].ex);
            text += this.msg.get("isOk");

            if(this.book.fileExists( this.sessions[recipientId].isbn, sself.essions[recipientId].page, this.sessions[recipientId].ex)) {
                url = self.getImageUrl(this.sessions[recipientId].isbn, this.sessions[recipientId].page, this.sessions[recipientId].ex);
                this.clearSession(recipientId);
            }else{
                text = this.msg.get("fileNotYetAvailable");
            }
        }
    }
    callBack(recipientId,text,url);
};

Peter.prototype.clearSession = function(recipientId) {
    if(this.sessions[recipientId] != undefined ){
        this.sessions[recipientId].isbn = "";
        this.sessions[recipientId].page = "";
        this.sessions[recipientId].ex = "";
        this.sessions[recipientId].lastOutput = "";
        this.sessions[recipientId].nbTry = 0;
    }
}