'use strict';

angular.module('Peter', [
    'ngRoute',
    'ngSanitize',
    'pascalprecht.translate',
    'ngResource',
    'afkl.lazyImage'
    ])
    .constant("Config",{
            "URL": "https://webhookpeter.herokuapp.com"
           // URL: "http://127.0.0.1:5000"
        }
    )
    .run(['$rootScope', '$route', function ($rootScope, $route) {
        $rootScope.$on('$routeChangeSuccess', function () {
            $rootScope.pageTitle = $route.current.title;
        });
    }]);

