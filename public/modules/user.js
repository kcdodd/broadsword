/*
    Copyright (C) 2015  Joulesmith Energy Technologies, LLC

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

"use strict";

define(['angular', 'restangular'], function (angular, restangular){

    var module = angular.module('user', ['restangular']);


    // apparently angular is just a global name space for dependencies anyway, so
    module.factory('user.auth', ['Restangular', '$window', function(Restangular, $window){

        var Auth = Restangular.all('user');

        var auth = {};
        var token_location = 'broadsword_token_location';

        var saveToken = function (token){
            $window.localStorage[token_location] = token;
        };

        var removeToken = function() {
            $window.localStorage.removeItem(token_location);
        }

        auth.getToken = function(){
            return $window.localStorage[token_location];
        };

        auth.getHeader = function() {
            return {
                headers: {Authorization: 'Bearer ' + auth.getToken()}
            };
        };

        /**
            Determine if user is already logged in based on expiration date in
            the token.

            @return false if not logged in, or the _id of the user in the token
        */
        auth.isLoggedIn = function() {
            var token = $window.localStorage[token_location];

            if(token){
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                if (payload.expiration > Date.now() / 1000){
                    return payload._id;
                }
            }

            return false;
        };

        /**
            Register a new user using a username and a password.

            user must have user.username and user.email
        */
        auth.register = function(user, response){

            Auth.post(user).then(function(data){
                response(data);
            }, function(error) {
                response(error);
            });

        };

        auth.setPassword = function(user, response){

            Auth.one(user.username).put({
                secret : user.secret,
                password : user.password
            })
            .then(function(data){
                response(data);
            }, function(error) {
                response(error);
            });
        };

        /**
            user.username
            user.password
        */
        auth.login = function(user, response){

            Auth.one(user.username).get({password : user.password})
            .then(function(data){
                saveToken(data.token);
                response(data);
            }, function(error) {
                response(error);
            });
        };

        auth.logout = function(){
            removeToken();
        };

        return auth;
    }]);


    module.controller('user.login', ['$scope', 'user.auth', function($scope, auth){
        $scope.user = {
            username : "",
            password : ""
        };

        $scope.auth = auth;

        $scope.response = function(err) {
            if (err) {
                $scope.message = err;
            }
        };
    }]);

    module.controller('user.register', ['$scope', 'user.auth', function($scope, auth){
        $scope.user = {
            username : "",
            email : ""
        };

        $scope.auth = auth;

        $scope.response = function(err) {
            if (err) {
                $scope.message = err;
            }
        };
    }]);

    module.controller('user.reset', ['$scope', 'user.auth', function($scope, auth){
        $scope.user = {
            username : "",
            password : "",
            secret : ""
        };

        $scope.auth = auth;

        $scope.response = function(err) {
            if (err) {
                $scope.message = err;
            }
        };
    }]);

});