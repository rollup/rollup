const condition = Math.random() > 0.5;

label1: {
	if ( condition ) {
		break label1;
	}
	console.log( 'effect' );
}

label1NoEffect: {
	if ( condition ) {
		break label1NoEffect;
	}
}

label2: {
	while ( condition ) {
		if ( condition ) {
			break label2;
		}
	}
	console.log( 'effect' );
}

label2NoEffect: {
	while ( condition ) {
		if ( condition ) {
			break label2NoEffect;
		}
	}
}

label3:
	while ( condition ) {
		while ( condition ) {
			if ( condition ) {
				continue label3;
			}
		}
		console.log( 'effect' );
	}

