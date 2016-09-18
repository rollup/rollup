console.log( 'before' );
function Unused () {}

Unused.prototype.toString = function () {
	return 'unused';
};
console.log( 'after' );
