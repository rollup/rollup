let shouldSkip;
let shouldAbort;

export default function walk ( ast, { enter, leave }) {
	shouldAbort = false;
	visit( ast, null, enter, leave );
}

let context = {
	skip: () => shouldSkip = true,
	abort: () => shouldAbort = true
};

let childKeys = {};

let toString = Object.prototype.toString;

function isArray ( thing ) {
	return toString.call( thing ) === '[object Array]';
}

function visit ( node, parent, enter, leave ) {
	if ( !node || shouldAbort ) return;

	if ( enter ) {
		shouldSkip = false;
		enter.call( context, node, parent );
		if ( shouldSkip || shouldAbort ) return;
	}

	let keys = childKeys[ node.type ] || (
		childKeys[ node.type ] = Object.keys( node ).filter( key => typeof node[ key ] === 'object' )
	);

	let key, value, i, j;

	i = keys.length;
	while ( i-- ) {
		key = keys[i];
		value = node[ key ];

		if ( isArray( value ) ) {
			j = value.length;
			while ( j-- ) {
				visit( value[j], node, enter, leave );
			}
		}

		else if ( value && value.type ) {
			visit( value, node, enter, leave );
		}
	}

	if ( leave && !shouldAbort ) {
		leave( node, parent );
	}
}