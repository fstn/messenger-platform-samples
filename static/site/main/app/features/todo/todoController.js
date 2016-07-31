'use strict';

angular.module('Peter')
    .controller('TodoController', [
        '$scope', 'Todo',
        function ($scope,Todo) {
                var self = this;
                self.todos = Todo.get();

                self.IMAGE_URL = "https://webhookpeter.herokuapp.com/";
        }]);
