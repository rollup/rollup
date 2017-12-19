function spaces ( i ) {
	let result = '';
	while ( i-- ) result += ' ';
	return result;
}


function tabsToSpaces ( str ) {
	return str.replace( /^\t+/, match => match.split( '\t' ).join( '  ' ) );
}

export default function getCodeFrame ( source, line, column ) {
	let lines = source.split( '\n' );

	const frameStart = Math.max( 0, line - 3 );
	let frameEnd = Math.min( line + 2, lines.length );

	lines = lines.slice( frameStart, frameEnd );
	while ( !/\S/.test( lines[ lines.length - 1 ] ) ) {
		lines.pop();
		frameEnd -= 1;
	}

	const digits = String( frameEnd ).length;

	return lines
		.map( ( str, i ) => {
			const isErrorLine = frameStart + i + 1 === line;

			let lineNum = String( i + frameStart + 1 );
			while ( lineNum.length < digits ) lineNum = ` ${lineNum}`;

			if ( isErrorLine ) {
				const indicator = spaces( digits + 2 + tabsToSpaces( str.slice( 0, column ) ).length ) + '^';
				return `${lineNum}: ${tabsToSpaces( str )}\n${indicator}`;
			}

			return `${lineNum}: ${tabsToSpaces( str )}`;
		})
		.join( '\n' );
}
