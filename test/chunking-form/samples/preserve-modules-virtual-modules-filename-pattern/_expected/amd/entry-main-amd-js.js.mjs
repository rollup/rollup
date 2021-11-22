define(['./_virtual/entry-_virtualModule-amd-.mjs', './_virtual/entry-_virtualWithExt-amd-js.js.mjs', './_virtual/entry-_virtualWithAssetExt-amd-str.str.str.mjs'], (function (_virtualModule, _virtualWithExt, _virtualWithAssetExt) { 'use strict';

	assert.equal(_virtualModule.virtual, 'Virtual!');
	assert.equal(_virtualWithExt.virtual2, 'Virtual2!');
	assert.equal(_virtualWithAssetExt.virtual3, 'Virtual3!');

}));
