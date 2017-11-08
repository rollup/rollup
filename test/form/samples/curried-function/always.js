import curry1 from './curry1';

var always = curry1( function always ( val ) {
	return function () {
		return val;
	};
} );
export default always;
