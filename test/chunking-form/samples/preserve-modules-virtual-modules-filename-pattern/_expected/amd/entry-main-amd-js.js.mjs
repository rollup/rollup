define(['./entry-_virtual/_virtualModule-amd-.mjs', './entry-_virtual/_virtualWithExt-amd-js.js.mjs', './entry-_virtual/_virtualWithAssetExt-amd-str.str.str.mjs'], (function (_virtualModule, _virtualWithExt, _virtualWithAssetExt) { 'use strict';

	assert.equal(_virtualModule.virtual, 'Virtual!');
	assert.equal(_virtualWithExt.virtual2, 'Virtual2!');
	assert.equal(_virtualWithAssetExt.virtual3, 'Virtual3!');

}));
