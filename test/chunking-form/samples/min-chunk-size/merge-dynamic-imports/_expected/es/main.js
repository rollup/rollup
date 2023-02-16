const big =
	'1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';

const small1 = import('./generated-small2.js').then(function (n) { return n.s; });
const small2 = import('./generated-small2.js').then(function (n) { return n.a; });

export { big, small1, small2 };
