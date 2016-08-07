'use strict';

angular.module('Peter').config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/todo', {
                templateUrl: 'app/features/todo/todoView.html',
                controller: 'TodoController',
                controllerAs: '$ctrl',
                title: 'TODO',
                resolve: {
                    translationPart: [ 'TranslationService',function(TranslationService){
                        return TranslationService('global');
                    }]
                }
            })
            .when('/mapping', {
                templateUrl: 'app/features/mapping/mappingView.html',
                controller: 'MappingController',
                controllerAs: '$ctrl',
                title: 'MAPPING',
                resolve: {
                    translationPart: [ 'TranslationService',function(TranslationService){
                        return TranslationService('global');
                    }]
                }
            })
            .otherwise({
                redirectTo: '/todo'
            });
    }]);