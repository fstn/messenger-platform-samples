'use strict';

angular.module('Peter')
    .controller('MainController', [
        '$scope',
        '$translate',
        'AuthService',
        function ($scope, $translate, AuthService) {

            $scope.currentLanguage = 'fr_FR';

            $scope.authService = AuthService;

            $scope.changeLanguage = function (language) {
                $scope.currentLanguage = language;
                $translate.use(language);
            };

        }]);
