/* header retained */

/* lead removed */ var a = 1; // trail removed

/* lead removed */
var a = 1; /* trail
removed */

/* lead retained */
console.log(2); /* trail
retained */

if (globalVar) {
	// lead removed
	var a = 1; // trail removed
	// lead retained
	console.log(2); // trail retained
}

if (globalVar) {
	// lead removed
	var a = 1; // trail removed
	// lead retained
	console.log(2); // trail retained
	// lead removed
	var a = 1; // trail removed
}

if (globalVar) {
	// lead retained
	console.log(2); // trail retained
	// lead removed
	var a = 1; // trail removed
}

if (globalVar) {
	console.log(2);
	var a = 1; /* trail
	removed */
}

if (globalVar) { /* removed */ var a = 1; /* retained */ console.log(2);}

if (globalVar) { /* removed */ var a = 1; /* retained */ console.log(2); /* removed */ var a = 1;}

if (globalVar) { /* retained */ console.log(2); /* removed */ var a = 1;}

switch (globalVar) {
	case 1:
		// lead removed
		var a = 1; // trail removed
		// lead retained
		console.log(2); // trail retained
	case 2:
		// lead removed
		var a = 1; // trail removed
		// lead retained
		console.log(2); // trail retained
		// lead removed
		var a = 1;
	case 3:
		// lead retained
		console.log(2); // trail retained
		// lead removed
		var a = 1;
	case 4: var a = 1; /* lead retained */ console.log('3') // trail retained
	default:
		/* lead removed */
		var a = 1; // trail removed
		/* lead retained */
		console.log(2); // trail retained
}

// lead removed
var a = 1; // trail removed

// lead retained
console.log(2); // trail retained

// lead removed
var a = 1; // trail removed

/* footer retained */
