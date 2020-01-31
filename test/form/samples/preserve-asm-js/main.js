function asmjs_included_1() {
	'use asm';

	function noop(e) {
		// this is crucial
		e = e | 0;
	}

	return { noop: noop };
}

function asmjs_included_2() {
	'use asm';

	function noop(e) {
		e = e | 0;

		switch (e | 0) {
			case 10:
				return 10;

			default:
				return e | 0;
		}

		// this is crucial
		return e | 0;
	}

	return { noop: noop };
}

function asmjs_removed() {
	'use asm';

	function noop(e) {
		e = e | 0;
	}

	return { noop: noop };
}

console.log(asmjs_included_1().noop(3));
console.log(asmjs_included_2().noop(3));
