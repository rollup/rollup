'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var external = require('external');

var foo = 13;

const quux = 1;

const other = () => quux;

function baz() {
	return foo + external.value;
}

var create = Object.create,
	getPrototypeOf = Object.getPrototypeOf;

function unusedButIncluded() {
	const unusedConst = 'unused';
	if (true) {
		true ? 'first' : 'second';
	} else {
		(true && 'first') || 'second';
	}
	'sequence', 'expression';
	switch ('test') {
		case 'test':
			(() => {})();
		case 'other':
			'no effect';
		default:
			const ignored = 2;
	}
}

function test(
	unusedParam = {
		prop: function test() {
			var unused = 1;
		}
	}
) {}

test({
	prop: function test() {
		var unused = 1;
	}
});

exports.create = create;
exports.getPrototypeOf = getPrototypeOf;
exports.quux = quux;
exports.strange = quux;
