import './direct-relative-external';
import 'to-indirect-relative-external';
import 'direct-absolute-external';
import 'to-indirect-absolute-external';

// nested
Promise.resolve().then(function () { return existing; });
import('./direct-relative-external');
import('to-indirect-relative-external');
import('direct-absolute-external');
import('to-indirect-absolute-external');

const value = 'existing';
console.log('existing');

var existing = /*#__PURE__*/Object.freeze({
	__proto__: null,
	value: value
});

//main
Promise.resolve().then(function () { return existing; });
import('./direct-relative-external');
import('to-indirect-relative-external');
import('direct-absolute-external');
import('to-indirect-absolute-external');

import('dynamic-direct-external' + unknown);
import('to-dynamic-indirect-external');
Promise.resolve().then(function () { return existing; });
import('my' + 'replacement');
