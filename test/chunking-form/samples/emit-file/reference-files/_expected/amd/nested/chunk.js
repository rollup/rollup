define(['require', '../main'], (function (require, main) { 'use strict';

	var logo = new URL(require.toUrl('../assets/logo2-DJfvToLT.svg'), document.baseURI).href;

	main.showImage(logo);

}));
