'use strict';

if (globalVar) {
	// lead retained
	console.log(1); // trail retained
}

if (globalVar) {
	// lead retained
	console.log(1); // trail retained
}

if (globalVar) {
	// lead retained
	console.log(1); // trail retained
}

if (globalVar) { /* retained */ console.log(1);}

if (globalVar) { /* retained */ console.log(1);}

if (globalVar) { /* retained */ console.log(1);}
