define(['require', '../main'], (function (require, main) { 'use strict';

	var logo = new URL(require.toUrl('../assets/logo2-l7qbvg3v.svg'), document.baseURI).href;

	main.showImage(logo);

}));
