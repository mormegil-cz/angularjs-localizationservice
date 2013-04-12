'use strict';

/*
 * An AngularJS Localization Service
 *
 * Written by Jim Lavin
 * http://codingsmackdown.tv
 *
 * Modified by Petr Kadlec <mormegil@centrum.cz>
 */

angular.module('localization', []).
    factory('localize', ['$http', '$rootScope', '$window', function ($http, $rootScope, $window) {
        function loadResourceFile(localize, lang, successCallback) {
            $http({ method: "GET", url: localize.resourceUrl.replace('<>', lang), cache: true }).success(successCallback);
        }

        var localize = {
            // use the $window service to get the language of the user's browser
            language: $window.navigator.userLanguage || $window.navigator.language,
            // array to hold the localized resource string entries, null if not yet loaded
            dictionary: [],
            defaultDictionary: [],
            resourceUrl: '/i18n/resources-locale_<>.js',

            setLanguage: function (value) {
                // forget the original dictionary
                localize.dictionary = [];
                // change language and reload
                localize.language = value;
                localize.loadResources();
            },

            getLocalizedString: function (value) {
				// translate using the dictionary
                var localized = localize.dictionary[value] || localize.defaultDictionary[value] || '';

				// substitute arguments, if any
                for (var i = 1; i < arguments.length; ++i)
                {
                    localized = localized.replace('$' + i, arguments[i]);
                }

                return localized;
            },

            getLocalizedParsedString: function (value) {
				var localized = localize.getLocalizedString.apply(localize, arguments);

				// TODO

                return localized;
            },

            loadResources: function () {
                // request the resource files
                loadResourceFile(localize, localize.language, localize.resourceFileLoaded);
            },

            resourceFileLoaded: function (data) {
                // store the returned array in the dictionary
                localize.dictionary = data || [];
                // broadcast that the file has been loaded
                $rootScope.$broadcast('localizeResourcesUpdates');
            },
        };

        // load the default translation
        loadResourceFile(localize, 'default', function (data) {
			localize.defaultDictionary = data || [];
        });

        // load the translation for the default language
        localize.loadResources();

        // return the local instance when called
        return localize;
    } ]).
    filter('i18n', ['localize', function (localize) {
        return function() {
            return localize.getLocalizedString.apply(localize, arguments);
        };
    }]).directive('i18n', ['localize', function(localize){
        var i18nDirective = {
            restrict:"EAC",
            updateText:function(elm, token){
                var values = token.split('|');
                if (values.length >= 1) {
                    // construct the tag to insert into the element
                    var tag = localize.getLocalizedString(values[0]);
                    // update the element only if data was returned
                    if ((tag !== null) && (tag !== undefined) && (tag !== '')) {
                        if (values.length > 1) {
                            for (var index = 1; index < values.length; index++) {
                                var target = '{' + (index - 1) + '}';
                                tag = tag.replace(target, values[index]);
                            }
                        }
                        // insert the text into the element
                        elm.text(tag);
                    };
                }
            },

            link:function (scope, elm, attrs) {
                scope.$on('localizeResourcesUpdates', function() {
                    i18nDirective.updateText(elm, attrs.i18n);
                });

                attrs.$observe('i18n', function (value) {
                    i18nDirective.updateText(elm, attrs.i18n);
                });
            }
        };

        return i18nDirective;
    }]);