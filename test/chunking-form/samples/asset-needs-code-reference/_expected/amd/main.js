define(['module', 'require'], (function (module, require) { 'use strict';

	var asset2 = new URL(require.toUrl('./logo2.svg'), new URL(module.uri, document.baseURI).href).href;

	{
		const image = document.createElement('img');
		image.src = asset2;
		document.body.appendChild(image);
	}

}));
