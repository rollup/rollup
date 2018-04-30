const value = 1;

if (value > 0) {
	console.log('retained');
} else {
	console.log('removed');
}

const values = {
	useFirst: true,
	useSecond: false
};

if (values.useFirst) {
	console.log('retained');
} else {
	console.log('removed');
}

if ((values.useSecond || values).useFirst) {
	console.log('retained');
} else {
	console.log('removed');
}

if ((values.useSecond ? {useFirst: false} : values).useFirst) {
	console.log('retained');
} else {
	console.log('removed');
}

if (({useFirst: false}, values).useFirst) {
	console.log('retained');
} else {
	console.log('removed');
}
