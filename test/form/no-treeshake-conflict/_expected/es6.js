import * as external from 'external';

var foo = 'unused';

const quux = 1;

const other = () => quux;

function bar () {
	return foo;
}

function baz () {
	return 13 + external.value;
}

var create = Object.create;
var getPrototypeOf = Object.getPrototypeOf;

export { baz, create, getPrototypeOf, quux as strange };