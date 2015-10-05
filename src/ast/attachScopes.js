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
			// function foo () {...}
			// class Foo {...}
			if ( /(Function|Class)Declaration/.test( node.type ) ) {
				scope.addDeclaration( node, false, false );
			}

			// var foo = 1
			if ( node.type === 'VariableDeclaration' ) {
				const isBlockDeclaration = blockDeclarations[ node.kind ];
				// only one declarator per block, because we split them up already
				scope.addDeclaration( node.declarations[0], isBlockDeclaration, true );
			}

			let newScope;

			// create new function scope
			if ( /Function/.test( node.type ) ) {
				newScope = new Scope({
					parent: scope,
					block: false,
					params: node.params
				});

				// named function expressions - the name is considered
				// part of the function's scope
				if ( node.type === 'FunctionExpression' && node.id ) {
					newScope.addDeclaration( node, false, false );
				}
			}

			// create new block scope
			if ( node.type === 'BlockStatement' && !/Function/.test( parent.type ) ) {
				newScope = new Scope({
					parent: scope,
					block: true
				});
			}

			// catch clause has its own block scope
			if ( node.type === 'CatchClause' ) {
				newScope = new Scope({
					parent: scope,
					params: [ node.param ],
					block: true
				});
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
