if ('x' in null) {
	console.log('retained');
}

if ('x' in undefined) {
	console.log('retained');
}

if ('x' in 1) {
	console.log('retained');
}

if ('x' in true) {
	console.log('retained');
}

if ('x' in 'y') {
	console.log('retained');
}

if (null instanceof null) {
	console.log('retained');
}

if (null instanceof undefined) {
	console.log('retained');
}

if (null instanceof 1) {
	console.log('retained');
}

if (null instanceof true) {
	console.log('retained');
}

if (null instanceof 'y') {
	console.log('retained');
}

if (null instanceof {}) {
	console.log('retained');
}
