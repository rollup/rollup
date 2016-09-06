import flatten from '../../utils/flatten.js';
import isReference from '../../utils/isReference.js';
import pureFunctions from './pureFunctions.js';
import { UNKNOWN } from '../../values.js';

function fnHasEffects ( fn ) {
	if ( fn._calling ) return true; // prevent infinite loops... TODO there must be a better way
	fn._calling = true;

	// handle body-less arrow functions
	const scope = fn.body.scope || fn.scope;
	const body = fn.body.body || [ fn.body ];

	for ( const node of body ) {
		if ( node.hasEffects( scope ) ) {
			fn._calling = false;
			return true;
		}
	}

	fn._calling = false;
	return false;
}

export default function callHasEffects ( scope, callee ) {
	const values = new Set([ callee ]);

	for ( const node of values ) {
		if ( node === UNKNOWN ) return true; // err on side of caution

		if ( /Function/.test( node.type ) ) {
			if ( fnHasEffects( node ) ) return true;
		}

		else if ( isReference( node ) ) {
			const flattened = flatten( node );
			const declaration = scope.findDeclaration( flattened.name );

			if ( declaration.isGlobal ) {
				if ( !pureFunctions[ flattened.keypath ] ) return true;
			}

			else if ( declaration.isExternal ) {
				return true; // TODO make this configurable? e.g. `path.[whatever]`
			}

			else {
				if ( node.declaration ) {
					node.declaration.gatherPossibleValues( values );
				} else {
					return true;
				}
			}
		}

		else {
			if ( !node.gatherPossibleValues ) {
				throw new Error( 'TODO' );
			}
			node.gatherPossibleValues( values );
		}
	}

	return false;
}
