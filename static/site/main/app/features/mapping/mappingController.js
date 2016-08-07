'use strict';

angular.module('Peter')
    .controller('MappingController', [
            '$scope','$rootScope', 'Todo', 'Page','Config',
            function ($scope,$rootScope, Todo, Page, Config) {
                var self = this;
                self.pagesToShow = [];
                self.pages = [];
                self.IMAGE_URL =  Config.URL;
                self.pagesSet = "";
                self.selectedPages  = [];

                self.pageToMap = $rootScope.selectPage;
                self.isbnToMap = $rootScope.selectIsbn;

                if(angular.isUndefined(self.isbnToMap)){
                    self.isbnToMap="9782218962004";
                }
                Page.query({isbn:self.isbnToMap},function(pages){
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
                    var index = self.selectedPages.indexOf(page);
                    if(index != -1){
                        page.class = "unSelected-page";
                        self.selectedPages.splice(index, 1);
                    }else{
                        page.class = "selected-page";
                        self.selectedPages.push(page)
                    }
                }
        }]);
