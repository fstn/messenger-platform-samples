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
            .otherwise({
                redirectTo: '/todo'
            });
    }]);