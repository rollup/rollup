export const a = 1;

export function f1() {
	const b = 1;

	function f2() {
		const c = 3;

		function f3() {
			const d = 5;
			const e = 6;
			return d + e;
		}

		const f = 4;
		return c + f3() + f;
	}

	const g = 2;
	return b + f2() + g;
}

export const h = 1;
