import * as externalNs1 from 'external-ns-1';
import * as externalNs2 from 'external-ns-2';

const val = 5;

var ns = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.assign(/*#__PURE__*/Object.create(null), externalNs1, externalNs2, {
	val: val
}));

export default ns;
