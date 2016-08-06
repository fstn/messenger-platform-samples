/**
 * Created by stephen on 31/07/2016.
 */
"use strict";

module.exports = BookService;

const
    JsonDB = require('node-json-db'),
    walk    = require('walk');

function BookService(app){
    var self = this;
    self.app = app;
    self.db = new JsonDB("peter", true, false);
    self.list();
    self.listAvailablePages();
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


BookService.prototype.listAvailablePages = function(){
    var self = this;
    self.app.get('/pages/:isbn', function(req, res) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

        var files   = [];

        var isbn = req.params.isbn;
        var walker  = walk.walk('./static/teacher/'+isbn+'/', { followLinks: false });
        walker.on('file', function(root, stat, next) {
            // Add this file to the list of files
            root = root.replace("./","");
            files.push({url:root + stat.name});
            next();
        });

        walker.on('end', function() {
            res.json(files);
        });

    });
};
