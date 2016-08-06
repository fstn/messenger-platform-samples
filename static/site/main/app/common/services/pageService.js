/**
 * Created by stephen on 31/07/2016.
 */

'use strict';

angular.module('Peter')
    .factory('Page',  ['$resource','Config',
        function($resource,Config){
            return $resource(Config.URL+'/pages/:isbn',{}, {
                query: {
                    method: 'GET',
                    params: {
                        isbn: '@isbn'
                    },isArray:true
                }
            });
        }]
    );
