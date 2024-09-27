define(['exports', '../custom_modules/@my-scope/my-base-pkg/index'], (function (exports, index) { 'use strict';

  var module;
  var hasRequiredModule;

  function requireModule () {
  	if (hasRequiredModule) return module;
  	hasRequiredModule = 1;
  	const base2 = index.__require();

  	module = {
  	  base2,
  	};
  	return module;
  }

  exports.__require = requireModule;

}));
