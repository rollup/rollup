if (console.log(1) || unknown) {
	const x = 1;
} else {
	const x = 2;
}

if (true) {
	console.log('kept');
}

if (true) {
	console.log('kept');
} else {
	console.log('removed');
}

if (true) {
	console.log('kept');
} else {
	console.log('removed');
	var a;
}
console.log(a);

function noEffect(){}

if (noEffect(), true) {
	console.log('kept');
} else {
	console.log('removed');
	var b;
}
console.log(b);

if (console.log('effect'), true) {
	console.log('kept');
}

if (console.log('effect'), true) {
	console.log('kept');
} else {
	console.log('removed');
}

// removed completely
if (false) {
	console.log('removed');
}

if (false) {
	console.log('removed');
} else {
	console.log('kept');
}

if (false) {
	console.log('removed');
	var c;
}
console.log(c);

if (false) {
	console.log('removed');
	var d;
} else {
	console.log('kept');
}
console.log(d);

if (console.log('effect'), false) {
	console.log('removed');
}

if (console.log('effect'), false) {
	console.log('removed');
} else {
	console.log('kept');
}
