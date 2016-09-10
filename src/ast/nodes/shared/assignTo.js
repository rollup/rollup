import extractNames from '../../utils/extractNames.js';

export default function assignToForLoopLeft ( node, scope, value ) {
	if ( node.type === 'VariableDeclaration' ) {
		for ( const proxy of node.declarations[0].proxies.values() ) {
			proxy.possibleValues.add( value );
		}
	}

	else {
		while ( node.type === 'ParenthesizedExpression' ) node = node.expression;

		if ( node.type === 'MemberExpression' ) {
			// apparently this is legal JavaScript? Though I don't know what
			// kind of monster would write `for ( foo.bar of thing ) {...}`

			// for now, do nothing, as I'm not sure anything needs to happen...
		}

		else {
			for ( const name of extractNames( node ) ) {
				const declaration = scope.findDeclaration( name );
				if ( declaration.possibleValues ) {
					declaration.possibleValues.add( value );
				}
			}
		}
	}
}
