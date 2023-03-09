// function
function foo(getObj) {
	getObj().x = true;
}

const obj1 = { x: false };
foo(function() {
	return obj1;
});

if (!obj1.x) {
	throw new Error('function parameter reassignment not tracked');
}

// // arrow function
// const bar = getObj => {
// 	getObj().x = true;
// };
//
// const obj2 = { x: false };
// foo(() => obj2);
//
// if (!obj2.x) {
// 	throw new Error('function parameter reassignment not tracked');
// }
//
// // constructor
// function Bar(getObj) {
// 	getObj().x = true;
// }
//
// const obj3 = { x: false };
// new Bar(() => obj3);
//
// if (!obj3.x) {
// 	throw new Error('constructor parameter reassignment not tracked');
// }
