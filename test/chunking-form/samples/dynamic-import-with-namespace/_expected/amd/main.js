define(['require'], (function (require) { 'use strict';

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module1'], resolve, reject); });
		module.foo();
		// disabled
		module[global.unknown]();
		module.baz();
	})();

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module2'], resolve, reject); });
		const module1 = module;
		module1.foo();
	})();

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module3'], resolve, reject); });
		const { foo } = module;
		foo();
	})();

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module4'], resolve, reject); });
		// disabled
		const { foo, ...rest } = module;
		foo();
		rest.bar();
	})();

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module5'], resolve, reject); });
		readFoo({ foo: () => {} });
		readFoo(module);
		function readFoo(module1) {
			module1.foo();
		}
		function readBar(module2) {
			module2.bar();
		}
		readBar(module);
	})();

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module6'], resolve, reject); });
		function b({ foo }) {
			foo();
		}
		b(module);
	})();

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module7'], resolve, reject); });
		// disabled
		function b({ foo, ...rest }) {
			foo();
			assert.ok(rest);
		}
		b(module);
	})();

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module8'], resolve, reject); });
		// disabled
		function b(o1, ...rest) {
			assert.ok(rest);
		}
		b(o1, o2, module);
	})();

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module9'], resolve, reject); });
		// disabled
		function b({ foo = 1 }) {
			assert.ok(foo);
		}
		b(module);
	})();

	(async () => {
		const module = await new Promise(function (resolve, reject) { require(['./generated-module10'], resolve, reject); });
		(module).bar();
		(global.unknown && module).foo();
		(global.unknown ? module : 'foo').baz();
	})();

}));
