const value = 1;

if (value > 0) {
	console.log('retained');
} else {
	console.log('removed');
}

const USE_FOURTH = 'use-fourth';
const values = {
	useFirst: true,
	useSecond: false,
	"use-third": true,
	[USE_FOURTH]: true
};

if (values.useFirst) {
	console.log('retained');
} else {
	console.log('removed');
}

if (values['use-third']) {
	console.log('retained');
} else {
	console.log('removed');
}

if (values[USE_FOURTH]) {
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
