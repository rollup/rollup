if (unknown)
	for (var x = 1; x--; x > 0)
		if (!unknown) console.log('effect');
		else 'Side effect free code to be dropped';
else throw new Error("Shouldn't be reached");

if (unknown)
	for (var x = 1; x--; x > 0)
		if ((console.log(), false)) console.log('effect');
		else 'Side effect free code to be dropped';
else throw new Error("Shouldn't be reached");

if (unknown) {
	for (var x = 1; x--; x > 0)
		if (!unknown) console.log('effect');
		else 'Side effect free code to be dropped';
} else throw new Error("Shouldn't be reached");

if (unknown)
	for (var x = 1; x--; x > 0)
		if (!unknown) console.log('effect');
		else 'Side effect free code to be dropped';
