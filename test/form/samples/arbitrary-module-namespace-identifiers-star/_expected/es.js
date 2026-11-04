import { "*" as __ } from 'external';
export { "*" as "**", "*" as reexportedStar } from 'external';

const star = 'star';
const doubleStar = 'double star';

var dep = /*#__PURE__*/Object.freeze({
	__proto__: null,
	"*": star,
	"**": doubleStar
});

console.log(__, star, doubleStar, true, false, dep);

const legal = 10;

export { legal as "*" };
