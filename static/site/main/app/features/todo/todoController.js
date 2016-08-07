'use strict';

angular.module('Peter')
    .controller('TodoController', [
            '$scope', '$rootScope', '$location', 'Todo', 'Page','Config',
            function ($scope, $rootScope, $location, Todo, Page, Config) {
                var self = this;
                self.todos = Todo.get();


                self.selectTodo = function(page,isbn){
                    $rootScope.selectPage = page;
                    $rootScope.selectIsbn = isbn;
                    $location.url("/mapping")

                }
        }]);
