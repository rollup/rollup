(function () {
	'use strict';

	/* header retained */

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

	switch (globalVar) {
		case 1:
			// lead retained
			console.log(1); // trail retained
		case 2:
			// lead retained
			console.log(1); // trail retained

		case 3:
			// lead retained
			console.log(1); // trail retained

		case 4:  /* lead retained */ console.log('3'); // trail retained
	}

	// lead retained
	console.log(1); // trail retained

	/* footer retained */

}());
