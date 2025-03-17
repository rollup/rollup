define(['exports', './generated-chain-2', './generated-leaf'], (function (exports, chain2, leaf) { 'use strict';

	console.log('from import:', chain2.default, chain2.four);

	exports.default = chain2.default;

}));
