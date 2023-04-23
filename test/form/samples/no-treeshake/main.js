import * as external from 'external';
import foo from './foo.js';

export { quux as strange } from './quux.js';
export * from './quux.js';

function baz() {
	return foo + external.value;
}

export var create = Object.create,
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

const { fred } = await import('./dynamic-imported.js');
