define(['module', './chunk'], function (module, main) { 'use strict';

	main.log('nested: ' + new URL(module.uri, document.baseURI).href);

});
