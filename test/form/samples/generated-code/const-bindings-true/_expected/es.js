import * as foo$1 from 'external';
import foo__default from 'external';
export * from 'external';

const _missingExportShim = void 0;

const foo = 'bar';

const other = /*#__PURE__*/Object.freeze({
	__proto__: null,
	foo: foo,
	missing: _missingExportShim
});

const synthetic = { bar: 'baz'};

console.log(foo__default, foo$1, other, synthetic.bar, _missingExportShim);
const main = 42;

const syntheticMissing = synthetic.syntheticMissing;
export { main as default, syntheticMissing };
