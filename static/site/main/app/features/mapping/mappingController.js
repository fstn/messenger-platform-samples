'use strict';

angular.module('Peter')
    .controller('MappingController', [
            '$scope', 'Todo', 'Page','Config',
            function ($scope, Todo, Page, Config) {
                var self = this;
                self.pagesToShow = [];
                self.pages = [];
                self.IMAGE_URL =  Config.URL;
                self.pagesSet = ""
                self.seclectedPages  = [];
                Page.query({isbn:"9782218962004"},function(pages){
                    self.pages= pages;
                    self.slider.options.ceil =  self.pages.length;
                });

                self.slider = {
                    min:0,
                    max:10,
                    options: {
                        floor: 0,
                        id: 'slider-id',
                        ceil: self.pages.length
                    }
                };

                self.updateContent = function() {
                    self.pagesToShow = [];
                    for (var i = self.slider.min; i < self.slider.max; i++) {
                        if (angular.isDefined(self.pages[i])) {
                            self.pagesToShow.push(self.pages[i]);
                        }
                    }
                };

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
