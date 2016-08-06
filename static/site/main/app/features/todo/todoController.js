'use strict';

angular.module('Peter')
    .controller('TodoController', [
            '$scope', 'Todo', 'Page','Config',
            function ($scope, Todo, Page, Config) {
                var self = this;
                self.todos = Todo.get();

                self.IMAGE_URL =  Config.URL;
                self.pagesSet = ""
                self.seclectedPages  = [];
                Page.query({isbn:"9782218962004"},function(pages){
                    self.pages= pages;
                });



                self.selectPage = function(page){
                    var index = self.seclectedPages.indexOf(page);
                    if(index != -1){
                        page.class = "unSelected-page";
                        self.seclectedPages.splice(index, 1);
                    }else{
                        page.class = "selected-page";
                        self.seclectedPages.push(page)
                    }
                }
        }]);
