import * as externalNs1 from 'external-ns-1';
import * as externalNs2 from 'external-ns-2';

const val = 5;

var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(externalNs1, externalNs2, {
	__proto__: null,
	val: val
}));

export default ns;
