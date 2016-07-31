'use strict';

angular.module('Peter')
    .controller('LoginController', [
        '$scope',
        'AuthService',
        function ($scope, AuthService) {

            $scope.authService = AuthService;

        }]);
