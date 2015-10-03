import { walk } from 'estree-walker';
import Scope from './Scope';

const blockDeclarations = {
	'const': true,
	'let': true
};

export default function attachScopes ( statement ) {
	let { node, scope } = statement;

	walk( node, {
		enter ( node, parent ) {
			let newScope;

			switch ( node.type ) {
				case 'FunctionDeclaration':
					scope.addDeclaration( node, false, false );
					break;

				case 'BlockStatement':
					if ( parent && /Function/.test( parent.type ) ) {
						newScope = new Scope({
							parent: scope,
							block: false,
							params: parent.params
						});

						// named function expressions - the name is considered
						// part of the function's scope
						if ( parent.type === 'FunctionExpression' && parent.id ) {
							newScope.addDeclaration( parent, false, false );
						}
					} else {
						newScope = new Scope({
							parent: scope,
							block: true
						});
					}

					break;

				case 'CatchClause':
					newScope = new Scope({
						parent: scope,
						params: [ node.param ],
						block: true
					});

					break;

				case 'VariableDeclaration':
					node.declarations.forEach( declarator => {
						const isBlockDeclaration = node.type === 'VariableDeclaration' && blockDeclarations[ node.kind ];
						scope.addDeclaration( declarator, isBlockDeclaration, true );
					});
					break;

				case 'ClassDeclaration':
					scope.addDeclaration( node, false, false );
					break;
			}

			if ( newScope ) {
				Object.defineProperty( node, '_scope', {
					value: newScope,
					configurable: true
				});

				scope = newScope;
			}
		},
		leave ( node ) {
			if ( node._scope ) {
				scope = scope.parent;
			}
		}
	});
}
