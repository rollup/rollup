console.log(false ?
	'unexpected' :
	/* keep me */
	'expected');

console.log(true ?
	/* keep me */
	'expected' :
	'unexpected');

console.log(true &&
	/* keep me */
	'expected');

console.log((true,
	/* keep me */
	'expected'));
