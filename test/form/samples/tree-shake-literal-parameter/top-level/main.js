function foo(x) {
	// The exported function might also be called with "false"
	if (x) console.log('true');
	else console.log('false');
}

// global variable should not be optimized
foo2 = (x) => {
	if (x) console.log('true');
	else console.log('false');
}

// export default should not be optimized
export default foo3 = (x) => {
	if (x) console.log('true');
	else console.log('false');
}

foo(true);
foo2(true);
foo3(true);

export { foo };
