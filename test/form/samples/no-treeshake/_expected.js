import * as external from 'external';

var foo = 13;

const quux = 1;

const other = () => quux;

const fred$1 = 1;

var dynamicImported = () => fred$1;

var dynamicImported$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	default: dynamicImported,
	fred: fred$1
});

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
	if (false) {
		'first';
	} else {
		'second';
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

try {
	const x = 1;
} catch {}

const { fred } = await Promise.resolve().then(function () { return dynamicImported$1; });

export { create, getPrototypeOf, quux, quux as strange };
