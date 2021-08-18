System.register('bundle', ['external'], ((exports, module) => {
	'use strict';
	var b;
	return {
		setters: [(module => {
			b = module.b;
		})],
		execute: (() => {

			let a; exports('a', a);

			(v => (exports('a', a), v))({a} = b);
			console.log((v => (exports('a', a), v))({a} = b));

			module.import('external').then(console.log);

		})
	};
}));
