const {
	a: { b }
} = { a: { b: { c: 1}}};
console.log(b.c);

const {
	a: { ...rest }
} = { a: { b: { c: 1, d: 1 }, e: 1 }};
console.log(rest);
