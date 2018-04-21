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
	function b() {}
}
console.log(typeof a, typeof b);

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
	function d() {}
}
console.log(typeof c, typeof d);

if (false) {
	console.log('removed');
	var e;
	function f() {}
} else {
	console.log('kept');
}
console.log(typeof e, typeof f);

if (console.log('effect'), false) {
	console.log('removed');
}

if (console.log('effect'), false) {
	console.log('removed');
} else {
	console.log('kept');
}
