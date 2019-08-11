const x = {
	"1": 1,
	[2]: 2
};

if (x[1] < 2) {
	console.log('kept');
} else {
	console.log('removed');
}

if (x["1"] < 2) {
	console.log('kept');
} else {
	console.log('removed');
}

if (x[2] > 1) {
	console.log('kept');
} else {
	console.log('removed');
}

if (x["2"] > 1) {
	console.log('kept');
} else {
	console.log('removed');
}
