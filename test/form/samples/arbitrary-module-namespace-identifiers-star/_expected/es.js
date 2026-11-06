import { "*" as __ } from 'external';
export * from 'external';
export { "*" as "**", "*" as reexportedStar } from 'external';

const star = 'star';
const doubleStar = 'double star';
var dep = 42;

var dep$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	"*": star,
	"**": doubleStar,
	default: dep
});

console.log(__, star, doubleStar, true, false, dep$1);

const legal = 10;

export { legal as "*", dep as "*default" };
