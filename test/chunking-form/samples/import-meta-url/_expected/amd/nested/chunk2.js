define(['module', './chunk'], function (module, log) { 'use strict';

	log.log('nested: ' + new URL(module.uri, document.baseURI).href);

});
