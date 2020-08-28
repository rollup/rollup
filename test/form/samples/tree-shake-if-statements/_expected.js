if (console.log(1) || unknown) ;

{
	console.log('kept');
}

{
	console.log('kept');
}

var a; {
	console.log('kept');
}
console.log(a);

var b; {
	console.log('kept');
}
console.log(b);

if (console.log('effect'), true) {
	console.log('kept');
}

if (console.log('effect'), true) {
	console.log('kept');
}

{
	console.log('kept');
}

var c; 
console.log(c);

var d; {
	console.log('kept');
}
console.log(d);

if (console.log('effect'), false) ;

if (console.log('effect'), false) ; else {
	console.log('kept');
}
