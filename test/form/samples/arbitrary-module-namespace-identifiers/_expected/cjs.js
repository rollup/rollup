'use strict';

var external = require('external');

function _interopNamespaceDefault(e) {
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n.default = e;
	return Object.freeze(n);
}

var external__namespace = /*#__PURE__*/_interopNamespaceDefault(external);

var main = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get 1 () { return one; },
	get bar () { return bar; },
	get "bar:\nfrom main'\"`" () { return bar; },
	get "class:\nfrom main'\"`" () { return C; },
	get "external:\nnamespace'\"`" () { return external__namespace; },
	get "external:\nre-exported'\"`" () { return external["external:\nre-exported'\"`"]; },
	get "foo:\nin quotes'\"`" () { return foo; },
	get 你好 () { return 你好; }
});

const foo = 42;
const one$1 = 43;
const 你好$1 = 44;

var dep = /*#__PURE__*/Object.freeze({
	__proto__: null,
	1: one$1,
	"foo:\nin quotes'\"`": foo,
	你好: 你好$1
});

console.log(external["external:\nfoo'\"`"], main, dep);

const bar = 42;
const one = 43;
class C {}

const 你好 = 44;

exports["external:\nnamespace'\"`"] = external__namespace;
Object.defineProperty(exports, "external:\nre-exported'\"`", {
	enumerable: true,
	get: function () { return external["external:\nre-exported'\"`"]; }
});
exports["1"] = one;
exports.bar = bar;
exports["bar:\nfrom main'\"`"] = bar;
exports["class:\nfrom main'\"`"] = C;
exports["foo:\nin quotes'\"`"] = foo;
exports.你好 = 你好;
