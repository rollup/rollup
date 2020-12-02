define(['../custom_modules/@my-scope/my-base-pkg/index'], function (index) { 'use strict';

  var module = {
    base2: index['default'],
  };

  return module;

});
