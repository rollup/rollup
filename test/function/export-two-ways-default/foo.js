export function X () {}

X.prototype.foo = function () {
	console.log( 'foo' );
	return this;
};

export default X; // export {X as Y} with corresponding export {Y as X} in x.js works
