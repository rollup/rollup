const e = 2.7182818284;

function something () {
	try {
		console.log( e );
	} catch ( e ) { // the catch identifier shadows the import
		console.error( e );
	}
}

export { something };
