import * as foo$1 from 'external';
import foo__default from 'external';
export * from 'external';

var _missingExportShim = void 0;

const foo = 'bar';

var other = /*#__PURE__*/Object.freeze({
	__proto__: null,
	foo: foo,
	missing: _missingExportShim
});

var synthetic = { bar: 'baz'};

console.log(foo__default, foo$1, other, synthetic.bar, _missingExportShim);
var main = 42;

var syntheticMissing = synthetic.syntheticMissing;
export { main as default, syntheticMissing };
