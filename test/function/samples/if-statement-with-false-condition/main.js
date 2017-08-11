export function whileIf(x) {
	while (x)
		if (false)
			// replaced with {}
			x = 0;
}

export function whileBlockIf(x) {
	while (x) {
		if (false)
			// removed
			x = 0;
	}
}

export function ifWhile(x) {
	if (x)
		while (false)
			// not optimized
			x = 0;
}

export function ifFalseElse(x) {
	if (false) {
		// removed
	} else {
		// kept
	}
}

export function elseIfFalse(x) {
	if (x) {
		// kept
	} else if (false) {
		// replaced with {}
	}
}

export function elseIfFalseElse(x) {
	if (x) {
		// kept
	} else if (false) {
		// removed
	} else {
		// kept
	}
}
