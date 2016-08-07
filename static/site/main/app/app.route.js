'use strict';

angular.module('Peter').config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider
            .when('/todo', {
                templateUrl: 'app/features/todo/todoView.html',
                controller: 'TodoController',
                controllerAs: '$ctrl',
                title: 'TODO'
            })
            .when('/mapping', {
                templateUrl: 'app/features/mapping/mappingView.html',
                controller: 'MappingController',
                controllerAs: '$ctrl',
                title: 'MAPPING'
            })
            .otherwise({
                redirectTo: '/todo'
            });
    }]);