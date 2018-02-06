import { value, more } from 'external';

var foo = 'unused';

const quux = 1;

const other = () => quux;

function bar () {
	return foo;
}

function baz () {
	return 13 + value;
}

const moreExternal = more;

var create = Object.create, getPrototypeOf = Object.getPrototypeOf;

export { baz, create, getPrototypeOf, quux as strange };
