// TODO does this all work on windows?

export const absolutePath = /^(?:\/|(?:[A-Za-z]:)?[\\|\/])/;

export function isAbsolute ( path ) {
	return absolutePath.test( path );
}

export function basename ( path ) {
	return path.split( /(\/|\\)/ ).pop();
}

export function dirname ( path ) {
	const match = /(\/|\\)[^\/\\]*$/.exec( path );
	if ( !match ) return '.';

	const dir = path.slice( 0, -match[0].length );

	// If `dir` is the empty string, we're at root.
	return dir ? dir : '/';
}

export function extname ( path ) {
	const match = /\.[^\.]+$/.exec( path );
	if ( !match ) return '';
	return match[0];
}

export function relative ( from, to ) {
	const fromParts = from.split( /[\/\\]/ ).filter( Boolean );
	const toParts = to.split( /[\/\\]/ ).filter( Boolean );

	while ( fromParts[0] && toParts[0] && fromParts[0] === toParts[0] ) {
		fromParts.shift();
		toParts.shift();
	}

	while ( toParts[0] === '.' || toParts[0] === '..' ) {
		const toPart = toParts.shift();
		if ( toPart === '..' ) {
			fromParts.pop();
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

			while ( parts[0] === '.' || parts[0] === '..' ) {
				const part = parts.shift();
				if ( part === '..' ) {
					resolvedParts.pop();
				}
			}

			resolvedParts.push.apply( resolvedParts, parts );
		}
	});

	return resolvedParts.join( '/' ); // TODO windows...
}
