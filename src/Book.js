module.exports = Book;

const fs = require("fs");

function  Book(){
    this.mapping = JSON.parse(fs.readFileSync('./book/mapping.json', 'utf8'));
}


Book.prototype.fileExists = function (isbn, page, ex){
    return this.mapping[isbn][page] != undefined;
};