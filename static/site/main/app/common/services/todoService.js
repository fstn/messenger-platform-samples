/**
 * Created by stephen on 31/07/2016.
 */

'use strict';

angular.module('Peter')
    .factory('Todo', ['$resource',
        function($resource){
            return $resource('https://webhookpeter.herokuapp.com/todo/books');
        }]
    );
