System.register('bundle', ['external'], (function (exports) {
	'use strict';
	var external__foo___, external, external__reExported___;
	return {
		setters: [function (module) {
			external__foo___ = module["external:\nfoo'\"`"];
			external = module;
			external__reExported___ = module["external:\nre-exported'\"`"];
			exports({ "external:\nnamespace'\"`": module, "external:\nre-exported'\"`": module["external:\nre-exported'\"`"] });
		}],
		execute: (function () {

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

			const foo = exports("foo:\nin quotes'\"`", 42);
			const one$1 = 43;
			const 你好$1 = 44;

			var dep = /*#__PURE__*/Object.freeze({
				__proto__: null,
				1: one$1,
				"foo:\nin quotes'\"`": foo,
				你好: 你好$1
			});

			console.log(external__foo___, main, dep);

			const bar = 42; exports({ bar: bar, "bar:\nfrom main'\"`": bar });
			const one = exports("1", 43);
			class C {} exports("class:\nfrom main'\"`", C);

			const 你好 = exports("你好", 44);

		})
	};
}));
