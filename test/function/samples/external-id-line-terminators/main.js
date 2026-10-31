import lf from 'module\nname';
import cr from 'module\rname';
import crlf from 'module\r\nname';
import lineSeparator from 'module name';
import paragraphSeparator from 'module name';
import quote from "module'name";
import backslash from 'module\\name';
import literalEscape from 'module\\nname';

assert.strictEqual(lf, 'module\nname');
assert.strictEqual(cr, 'module\rname');
assert.strictEqual(crlf, 'module\r\nname');
assert.strictEqual(lineSeparator, 'module name');
assert.strictEqual(paragraphSeparator, 'module name');
assert.strictEqual(quote, "module'name");
assert.strictEqual(backslash, 'module\\name');
assert.strictEqual(literalEscape, 'module\\nname');

export default Promise.all([
	import('module\nname'),
	import('module\rname'),
	import('module\r\nname'),
	import('module name'),
	import('module name')
]).then(modules => {
	assert.deepStrictEqual(
		modules.map(module => module.default),
		[lf, cr, crlf, lineSeparator, paragraphSeparator]
	);
});
