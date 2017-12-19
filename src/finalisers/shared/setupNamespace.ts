import { property } from './sanitize';

export default function setupNamespace ( name, root, forAssignment, globals ) {
	const parts = name.split( '.' );
	if (globals) {
		parts[0] = (typeof globals === 'function' ? globals( parts[0] ) : globals[ parts[ 0 ] ]) || parts[0];
	}

	const last = parts.pop();

	let acc = root;
	if (forAssignment) {
		return parts
			.map( part => ( acc += property( part ), `${acc} = ${acc} || {}` ) )
			.concat( `${acc}${property( last )}` )
			.join( ', ' );
	} else {
		return parts
			.map( part => ( acc += property( part ), `${acc} = ${acc} || {};` ) )
			.join( '\n' ) + '\n';
	}
}
