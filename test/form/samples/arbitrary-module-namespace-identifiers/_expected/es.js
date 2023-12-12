import * as external from 'external';
import { "external:\nfoo'\"`" as external__foo___, "external:\nre-exported'\"`" as external__reExported___ } from 'external';
export { external as "external:\nnamespace'\"`" };
export { "external:\nre-exported'\"`" } from 'external';

var main = /*#__PURE__*/Object.freeze({
	__proto__: null,
	get 1 () { return one; },
	get bar () { return bar; },
	get "bar:\nfrom main'\"`" () { return bar; },
	get "class:\nfrom main'\"`" () { return C; },
	get "external:\nnamespace'\"`" () { return external; },
	get "external:\nre-exported'\"`" () { return external__reExported___; },
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

console.log(external__foo___, main, dep);

const bar = 42;
const one = 43;
class C {}

const 你好 = 44;

export { one as "1", bar, bar as "bar:\nfrom main'\"`", C as "class:\nfrom main'\"`", foo as "foo:\nin quotes'\"`", 你好 };
