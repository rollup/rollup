'use strict';

async function test() {
	const dep = await Promise.resolve().then(function () { return require('./generated-dep.js'); });
	console.log(dep.obj.a.a.a);
}

test();
