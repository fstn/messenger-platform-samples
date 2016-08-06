/**
 * Created by stephen on 31/07/2016.
 */

'use strict';

angular.module('Peter')
    .factory('Todo', ['$resource','Config',
        function($resource,Config){
            return $resource(Config.URL+'/todo/books');
        }]
    );
