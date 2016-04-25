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

export { baz, quux as strange };
