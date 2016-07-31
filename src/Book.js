module.exports = Book;

const fs = require("fs"),
    JsonDB = require('node-json-db');

const IMAGE_URL = "https://webhookpeter.herokuapp.com/static/";

function  Book(){
    var self = this;
    //self.mapping = JSON.parse(fs.readFileSync('./static/mapping.json', 'utf8'));
    self.db = new JsonDB("peter", true, false);
}


Book.prototype.fileExists = function (isbn, page, ex){
    var self = this;
    var result = false;
    try {
        self.db.getData("books/" + isbn + "/" + page);
        result = true;
    } catch (error) {
        /**
         * This book and page is already present in to do list, just add to put user information
         */
        if (!error.message.startsWith("Can't find dataPath:")) {
            throw error;
        }
    }
    return result;
};

Book.prototype.getTeacherImageUrl = function (isbn, page, ex) {
    var self = this;
    url = IMAGE_URL + "/teacher/" + isbn + "/" + isbn + "-" + this.book.mapping[isbn][page] + ".jpg"
};

Book.prototype.getStudentImageUrl = function (isbn, page, ex) {
    var self = this;
    url = IMAGE_URL + "/student/" + isbn + "/" + isbn + "-" + this.book.mapping[isbn][page] + ".jpg"
};