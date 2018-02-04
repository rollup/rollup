System.register(['./escape.js', './_reEscape.js', './_reEvaluate.js', './_reInterpolate.js'], function (exports, module) {
  'use strict';
  var escape, reEscape, reEvaluate, reInterpolate;
  return {
    setters: [function (module) {
      escape = module.default;
    }, function (module) {
      reEscape = module.default;
    }, function (module) {
      reEvaluate = module.default;
    }, function (module) {
      reInterpolate = module.default;
    }],
    execute: function () {

      /**
       * By default, the template delimiters used by lodash are like those in
       * embedded Ruby (ERB) as well as ES2015 template strings. Change the
       * following template settings to use alternative delimiters.
       *
       * @static
       * @memberOf _
       * @type {Object}
       */
      var templateSettings = {

        /**
         * Used to detect `data` property values to be HTML-escaped.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        'escape': reEscape,

        /**
         * Used to detect code to be evaluated.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        'evaluate': reEvaluate,

        /**
         * Used to detect `data` property values to inject.
         *
         * @memberOf _.templateSettings
         * @type {RegExp}
         */
        'interpolate': reInterpolate,

        /**
         * Used to reference the data object in the template text.
         *
         * @memberOf _.templateSettings
         * @type {string}
         */
        'variable': '',

        /**
         * Used to import variables into the compiled template.
         *
         * @memberOf _.templateSettings
         * @type {Object}
         */
        'imports': {

          /**
           * A reference to the `lodash` function.
           *
           * @memberOf _.templateSettings.imports
           * @type {Function}
           */
          '_': { 'escape': escape }
        }
      };
      exports('default', templateSettings);

    }
  };
});
