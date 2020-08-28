if (false) {
	for (var a; unknownGlobal && true; unknownGlobal && true) var b;
} else {
	console.log(a, b);
}

if (((() => console.log('effect'))(), true)) {
} else {
	var c = 1;
	for (var c; unknownGlobal && true; unknownGlobal && true) var d;
}
console.log(c, d);
