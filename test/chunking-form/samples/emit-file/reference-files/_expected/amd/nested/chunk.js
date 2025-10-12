define(['module', 'require', '../main'], (function (module, require, main) { 'use strict';

	var logo = new URL(require.toUrl('../assets/logo2-DJfvToLT.svg'), new URL(module.uri, document.baseURI).href).href;

	main.showImage(logo);

}));
