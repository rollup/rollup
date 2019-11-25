async function main() {
	const foo = 1;
	const ns = await import('./foo.js');
	console.log(ns.value + foo);
}

main();
