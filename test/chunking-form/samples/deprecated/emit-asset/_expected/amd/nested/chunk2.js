define(['require', './chunk'], function (require, showImage) { 'use strict';

	var logo = new URL(require.toUrl('../assets/logo2-6d5979e4.svg'), document.baseURI).href;

	showImage.showImage(logo);

});
