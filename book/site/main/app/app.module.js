'use strict';

angular.module('Peter', [
    'ngRoute',
    'ngSanitize',
    'pascalprecht.translate',
    'ngResource'
    ])
    .run(['$rootScope', '$route', function ($rootScope, $route) {
        $rootScope.$on('$routeChangeSuccess', function () {
            $rootScope.pageTitle = $route.current.title;
        });
    }]);

