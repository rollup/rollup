function asmjs_included() {
	'use asm';

	function noop(e) {
		e = e | 0;

		switch (e | 0) {
			case 10:
				return 10;

			default:
				return e | 0;
		}
	}

	return { noop: noop };
}

console.log(asmjs_included().noop(3));
