/**
 * Created by stephen on 31/07/2016.
 */
"use strict";

module.exports = BookService;

const
    JsonDB = require('node-json-db');

function BookService(app){
    var self = this;
    self.app = app;
    self.db = new JsonDB("peter", true, false);
    self.list();
    self.listUnMapped();

}

BookService.prototype.list = function(){
    var self = this;
    self.app.get('/books', function(req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var listOfBooks = self.db.getData("/books");
        res.json(listOfBooks);
    });
};

BookService.prototype.listUnMapped = function(){
    var self = this;
    self.app.get('/todo/books', function(req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        var listOfBooks = self.db.getData("/todo/books");
        res.json(listOfBooks);
    });
};
