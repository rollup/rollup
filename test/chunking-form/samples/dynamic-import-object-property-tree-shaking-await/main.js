async function test() {
	const dep = await import('./dep.js');
	console.log(dep.obj.a.a.a);
}

test();
