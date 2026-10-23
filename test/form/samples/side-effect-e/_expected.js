function foo () {
	var Object = {
		keys: function () {
			console.log( 'side-effect' );
		}
	};
	Object.keys();
}

foo();
