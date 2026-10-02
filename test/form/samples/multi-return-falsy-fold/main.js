function f(x) {
	if (x) return 0;
	return x ? null : undefined;
}

if (f(globalThis.flag)) {
	console.log('removed');
}
