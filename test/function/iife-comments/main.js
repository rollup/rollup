function noop () {}

(function () {
	noop( '1' ) // line comment after statement

	/*
	BLOCK COMMENT
	*/

	noop( '2' );

	// standalone comment
})();

export default 42;
