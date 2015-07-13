// TODO does this all work on windows?

export const absolutePath = /^(?:\/|(?:[A-Za-z]:)?\\)/;

export function isAbsolute ( path ) {
	return absolutePath.test( path );
}

export function basename ( path ) {
	return path.split( /(\/|\\)/ ).pop();
}

export function dirname ( path ) {
	const match = /(\/|\\)[^\/\\]+$/.exec( path );
	if ( !match ) return '.';
	return path.slice( 0, -match[0].length );
}

export function extname ( path ) {
	const match = /\.[^\.]+$/.exec( path );
	if ( !match ) return '';
	return match[0]
}

export function relative ( from, to ) {
	const fromParts = from.split( /[\/\\]/ );
	const toParts = to.split( /[\/\\]/ );

	while ( fromParts[0] && toParts[0] && fromParts[0] === toParts[0] ) {
		fromParts.shift();
		toParts.shift();
	}

	while ( toParts[0] && toParts[0][0] === '.' ) {
		if ( toParts[0] === '.' ) {
			toParts.shift();
		} else if ( toParts[0] === '..' ) {
			fromParts.pop();
		} else {
			throw new Error( `Unexpected path part (${toParts[0]})` );
		}
	}

	while ( fromParts.pop() ) {
		toParts.unshift( '..' );
	}

	return toParts.join( '/' );
}

export function resolve ( ...paths ) {
	let resolvedParts = paths.shift().split( /[\/\\]/ );

	paths.forEach( path => {
		if ( isAbsolute( path ) ) {
			resolvedParts = path.split( /[\/\\]/ );
		} else {
			const parts = path.split( /[\/\\]/ );

			while ( parts[0] && parts[0][0] === '.' ) {
				if ( parts[0] === '.' ) {
					parts.shift();
				} else if ( parts[0] === '..' ) {
					resolvedParts.pop();
				}
			}

			resolvedParts.push.apply( resolvedParts, parts );
		}
	});

	return resolvedParts.join( '/' ); // TODO windows...
}
