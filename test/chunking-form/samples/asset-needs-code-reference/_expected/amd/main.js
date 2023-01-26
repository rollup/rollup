define(['require'], (function (require) { 'use strict';

	var asset2 = new URL(require.toUrl('./logo2.svg'), document.baseURI).href;

	{
		const image = document.createElement('img');
		image.src = asset2;
		document.body.appendChild(image);
	}

}));
