export default function getLocation ( source, charIndex ) {
	const lines = source.split( '\n' );
	const len = lines.length;

	let lineStart = 0;
	let i;

	for ( i = 0; i < len; i += 1 ) {
		const line = lines[i];
		const lineEnd =  lineStart + line.length + 1; // +1 for newline

		if ( lineEnd > charIndex ) {
			return { line: i + 1, column: charIndex - lineStart };
		}

		lineStart = lineEnd;
	}

	throw new Error( 'Could not determine location of character' );
}
