import isReference from 'is-reference';
import flatten from '../../utils/flatten.js';
import pureFunctions from './pureFunctions.js';

const currentlyCalling = new Set();

function isES5Function ( node ) {
	return node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration';
}

function hasEffectsNew ( node ) {
	let inner = node;

	if ( inner.type === 'ExpressionStatement' ) {
		inner = inner.expression;

		if ( inner.type === 'AssignmentExpression' ) {
			if ( inner.right.hasEffects() ) {
				return true;

			} else {
				inner = inner.left;

				if ( inner.type === 'MemberExpression' ) {
					if ( inner.computed && inner.property.hasEffects() ) {
						return true;

					} else {
						inner = inner.object;

						if ( inner.type === 'ThisExpression' ) {
							return false;
						}
					}
				}
			}
		}
	}

	return node.hasEffects();
}

function fnHasEffects ( fn, isNew ) {
	if ( currentlyCalling.has( fn ) ) return false; // prevent infinite loops... TODO there must be a better way
	currentlyCalling.add( fn );

	// handle body-less arrow functions
	const body = fn.body.type === 'BlockStatement' ? fn.body.body : [ fn.body ];

	for ( const node of body ) {
		if ( isNew ? hasEffectsNew( node ) : node.hasEffects() ) {
			currentlyCalling.delete( fn );
			return true;
		}
	}

	currentlyCalling.delete( fn );
	return false;
}

export default function callHasEffects ( scope, callee, isNew ) {
	const values = new Set( [ callee ] );

	for ( const node of values ) {
		if ( node.type === 'UNKNOWN' ) return true; // err on side of caution

		if ( /Function/.test( node.type ) ) {
			if ( fnHasEffects( node, isNew && isES5Function( node ) ) ) return true;
		}

		else if ( /Class/.test( node.type ) ) {
			// TODO find constructor (may belong to a superclass)
			return true;
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

		else if ( node.gatherPossibleValues ) {
			node.gatherPossibleValues( values );
		}

		else {
			// probably an error in the user's code — err on side of caution
			return true;
		}
	}

	return false;
}
