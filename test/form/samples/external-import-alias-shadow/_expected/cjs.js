'use strict';

var acorn = require('acorn');

function parse(source) {
	return acorn.parse(source, { ecmaVersion: 6 });
}

console.log(parse('foo'));
