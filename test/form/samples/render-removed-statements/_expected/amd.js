define(function () { 'use strict';

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

	if (globalVar) {
		// lead retained
		console.log(2); // trail retained
	}

	if (globalVar) {
		// lead retained
		console.log(2); // trail retained
	}

	if (globalVar) {
		// lead retained
		console.log(2); // trail retained
	}

	if (globalVar) {
		console.log(2);
	}

	if (globalVar) { /* retained */ console.log(2);}

	if (globalVar) { /* retained */ console.log(2);}

	if (globalVar) { /* retained */ console.log(2);}

	switch (globalVar) {
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

});
