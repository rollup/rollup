export default function curry1 ( fn ) {
	return function f1 ( a ) {
		return fn.apply( this, arguments );
	};
}
