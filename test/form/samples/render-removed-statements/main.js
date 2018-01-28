/* header retained */

/* lead removed */ const x = 1; // trail removed

if (globalVar) {
	// lead removed
	const x = 1; // trail removed
	// lead retained
	console.log(1); // trail retained
}

if (globalVar) {
	// lead removed
	const x = 1; // trail removed
	// lead retained
	console.log(1); // trail retained
	// lead removed
	const y = 1; // trail removed
}

if (globalVar) {
	// lead retained
	console.log(1); // trail retained
	// lead removed
	const y = 1; // trail removed
}

if (globalVar) { /* removed */ const x = 1; /* retained */ console.log(1);}

if (globalVar) { /* removed */ const x = 1; /* retained */ console.log(1); /* removed */ const y = 1;}

if (globalVar) { /* retained */ console.log(1); /* removed */ const y = 1;}

// lead removed
const y = 1; // trail removed

// lead retained
console.log(1); // trail retained

// lead removed
const z = 1; // trail removed

/* footer retained */
