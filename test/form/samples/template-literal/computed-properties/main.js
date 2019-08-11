const x = {
	[`x.y`]: true,
	[`x\ny`]: true,
	['a.b']: true,
	['a\nb']: true
};

if (x['x.y']) {
	console.log('kept');
} else {
	console.log('removed');
}

if (x['x\ny']) {
	console.log('kept');
} else {
	console.log('removed');
}

if (x[`a.b`]) {
	console.log('kept');
} else {
	console.log('removed');
}

if (x[`a\nb`]) {
	console.log('kept');
} else {
	console.log('removed');
}
