/* header retained */

 /* lead
retained */ console.log(2); // trail retained
console.log(2); // trail retained

/* lead retained */
console.log(2); /* trail
retained */ /* trail
retained */

console.log(2); // trail retained
 console.log(2);

if (globalThis.unknown) {
	// lead retained
	console.log(2); // trail retained
}

if (globalThis.unknown) {
	// lead retained
	console.log(2); // trail retained
}

if (globalThis.unknown) {
	// lead retained
	console.log(2); // trail retained
}

if (globalThis.unknown) {
	console.log(2);
}

if (globalThis.unknown) { /* retained */ console.log(2);}

if (globalThis.unknown) { /* retained */ console.log(2);}

if (globalThis.unknown) { /* retained */ console.log(2);}

switch (globalThis.unknown) {
	case 1: // retained
		// lead retained
		console.log(2); // trail retained
	case 2: // retained
		// lead retained
		console.log(2); // trail retained
 case 3: // retained
		// lead retained
		console.log(2); // trail retained
	case 4: /* lead retained */ console.log('3'); // trail retained
	default: // retained
		/* lead retained */
		console.log(2); // trail retained
}

// lead retained
console.log(2); // trail retained

/* footer retained */
