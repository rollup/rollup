define(['require', '../main'], (function (require, main) { 'use strict';

	var logo = new URL(require.toUrl('../assets/logo2-6d5979e4.svg'), document.baseURI).href;

	main.showImage(logo);

}));
