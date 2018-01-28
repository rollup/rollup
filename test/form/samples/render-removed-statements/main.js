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

switch (globalVar) {
	case 1:
		// lead removed
		const a = 1; // trail removed
		// lead retained
		console.log(1); // trail retained
	case 2:
		// lead removed
		const b = 1; // trail removed
		// lead retained
		console.log(1); // trail retained
		// lead removed
		const c = 1;
	case 3:
		// lead retained
		console.log(1); // trail retained
		// lead removed
		const d = 1;
	case 4: const e = 1; /* lead retained */ console.log('3') // trail retained
}

// lead removed
const y = 1; // trail removed

// lead retained
console.log(1); // trail retained

// lead removed
const z = 1; // trail removed

/* footer retained */
