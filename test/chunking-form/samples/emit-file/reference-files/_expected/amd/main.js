define(['require', './nested/chunk'], function (require, showImage) { 'use strict';

	var logo = new URL(require.toUrl('./assets/logo1-a5ec488b.svg'), document.baseURI).href;

	showImage.showImage(logo);
	new Promise(function (resolve, reject) { require(['./nested/chunk2'], resolve, reject) });

});
