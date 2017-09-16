const condition = Math.random() > 0.5;

label1: {
	if ( condition ) {
		break label1;
	}
	console.log( 'effect' );
}

label2: {
	while ( condition ) {
		if ( condition ) {
			break label2;
		}
	}
	console.log( 'effect' );
}

label3:
	while ( foo ) {
		while ( bar ) {
			if ( condition ) {
				continue label3;
			}
		}
		console.log( 'effect' );
	}
