'use strict';

angular.module('Peter', [
    'ngRoute',
    'ngSanitize',
    'pascalprecht.translate',
    'ngResource',
    'afkl.lazyImage',
    'rzModule'
    ])
    .constant("Config",{
            "URL": "https://webhookpeter.herokuapp.com"
          //  URL: "http://127.0.0.1:5000"
        }
    )
    .config(['$translateProvider','$translatePartialLoaderProvider', function ($translateProvider,$translatePartialLoaderProvider) {
        // Declare languages mapping
        $translateProvider.registerAvailableLanguageKeys(['en', 'fr', 'de'], {
            'en_US': 'en',
            'en_GB': 'en',
            'fr_FR': 'fr',
            'fr-CA': 'fr',
            'de-DE': 'de'
        }).determinePreferredLanguage();

        // Use partial loader
        $translateProvider.useLoader('$translatePartialLoader', {
            urlTemplate: 'assets/locale/{part}.json'
        });

        $translateProvider.useSanitizeValueStrategy();
    }])
    .run(['$rootScope', '$route', function ($rootScope, $route) {
        $rootScope.$on('$routeChangeSuccess', function () {
            $rootScope.pageTitle = $route.current.title;
        });
    }]);

