var b, a; {
	console.log(a, b);
}

var c, d; if (((() => console.log('effect'))(), true)) ;
console.log(c, d);
