define(['require'], (function (require) { 'use strict';

	async function test() {
		const dep = await new Promise(function (resolve, reject) { require(['./generated-dep'], resolve, reject); });
		console.log(dep.obj.a.a.a);
	}

	test();

}));
