import { UNKNOWN } from '../../values.js';

export default function isUsedByBundle ( scope, node ) {
	while ( node.type === 'ParenthesizedExpression' ) node = node.expression;

	// const expression = node;
	while ( node.type === 'MemberExpression' ) node = node.object;

	const declaration = scope.findDeclaration( node.name );

	if ( declaration.isParam ) {
		return true;

		// TODO if we mutate a parameter, assume the worst
		// return node !== expression;
	}

	if ( declaration.activated ) return true;

	const values = new Set();
	declaration.gatherPossibleValues( values );
	for ( const value of values ) {
		if ( value === UNKNOWN ) {
			return true;
		}

		if ( value.type === 'Identifier' ) {
			if ( value.declaration.activated ) {
				return true;
			}
			value.declaration.gatherPossibleValues( values );
		}

		else if ( value.gatherPossibleValues ) {
			value.gatherPossibleValues( values );
		}
	}

	return false;
}
