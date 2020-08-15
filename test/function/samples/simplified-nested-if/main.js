export let foo = 0;

if (unknown)
	for (var x = 1; x-- > 0; )
		if (!unknown) foo++;
		else 'Side effect free code to be dropped';
else throw new Error("Shouldn't be reached");

if (unknown)
	for (var x = 1; x-- > 0; )
		if (foo++, false) foo++;
		else 'Side effect free code to be dropped';
else throw new Error("Shouldn't be reached");

if (unknown) {
	for (var x = 1; x-- > 0; )
		if (!unknown) foo++;
		else 'Side effect free code to be dropped';
} else throw new Error("Shouldn't be reached");

if (unknown)
	for (var x = 1; x-- > 0; )
		if (!unknown) foo++;
		else 'Side effect free code to be dropped';
