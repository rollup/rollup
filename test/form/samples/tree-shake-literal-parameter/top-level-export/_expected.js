function foo(x) {
	// The exported function might also be called with "false"
	if (x) console.log('true');
	else console.log('false');
}

foo(true);

export { foo };
