/* header retained */

/* lead removed */ var a = 1; // trail removed

/* lead removed */
var a = 1; /* lead
retained */ console.log(2); // trail retained

/* lead removed */
var a = 1; /* trail
removed */ /* trail
removed */
console.log(2); // trail retained

/* lead retained */
console.log(2); /* trail
retained */ /* trail
retained */

console.log(2); // trail retained
var a = 1; console.log(2);

if (globalThis.unknown) {
	// lead removed
	var a = 1; // trail removed
	// lead retained
	console.log(2); // trail retained
}

if (globalThis.unknown) {
	// lead removed
	var a = 1; // trail removed
	// lead retained
	console.log(2); // trail retained
	// lead removed
	var a = 1; // trail removed
}

if (globalThis.unknown) {
	// lead retained
	console.log(2); // trail retained
	// lead removed
	var a = 1; // trail removed
}

if (globalThis.unknown) {
	console.log(2);
	var a = 1; /* trail
	removed */
}

if (globalThis.unknown) { /* removed */ var a = 1; /* retained */ console.log(2);}

if (globalThis.unknown) { /* removed */ var a = 1; /* retained */ console.log(2); /* removed */ var a = 1;}

if (globalThis.unknown) { /* retained */ console.log(2); /* removed */ var a = 1;}

switch (globalThis.unknown) {
	case 1: // retained
		// lead removed
		var a = 1; // trail removed
		// lead retained
		console.log(2); // trail retained
	case 2: // retained
		// lead removed
		var a = 1; // trail removed
		// lead retained
		console.log(2); // trail retained
		// lead removed
		var a = 1; case 3: // retained
		// lead retained
		console.log(2); // trail retained
		// lead removed
		var a = 1;
	case 4: /* lead removed */ var a = 1; /* lead retained */ console.log('3'); // trail retained
	default: // retained
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
