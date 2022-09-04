define(['require', '../main'], (function (require, main) { 'use strict';

	var logo = new URL(require.toUrl('../assets/logo2-fdaa7478.svg'), document.baseURI).href;

	main.showImage(logo);

}));
