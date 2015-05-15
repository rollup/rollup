import walk from './walk';
import Scope from './Scope';
import { getName } from '../utils/map-helpers';

function isStatement ( node, parent ) {
	return node.type === 'ExportDefaultDeclaration' ||
	       node.type === 'ExpressionStatement' ||
	       node.type === 'VariableDeclaration' ||
	       node.type === 'FunctionDeclaration'; // TODO or any of the other various statement-ish things it could be
}

export default function analyse ( ast, code ) {
	let scope = new Scope();
	let topLevelStatements = [];
	let currentTopLevelStatement;

	function addToScope ( declarator ) {
		var name = declarator.id.name;
		scope.add( name, false );

		if ( !scope.parent ) {
			currentTopLevelStatement._defines[ name ] = true;
		}
	}

	function addToBlockScope ( declarator ) {
		var name = declarator.id.name;
		scope.add( name, true );

		if ( !scope.parent ) {
			currentTopLevelStatement._defines[ name ] = true;
		}
	}

	// TODO include imports in top-level scope?

	// first we need to generate comprehensive scope info
	let previous = 0;

	ast.body.forEach( statement => {
		statement._defines = {};
		statement._modifies = {};
		statement._dependsOn = {};

		// store the actual code, for easy regeneration
		statement._source = code.snip( previous, statement.end );
		previous = statement.end;

		currentTopLevelStatement = statement; // so we can attach scoping info

		walk( statement, {
			enter ( node, parent ) {
				switch ( node.type ) {
					case 'FunctionExpression':
					case 'FunctionDeclaration':
					case 'ArrowFunctionExpression':
						if ( node.id ) {
							addToScope( node );
						}

						let names = node.params.map( getName );

						scope = new Scope({
							parent: scope,
							params: names, // TODO rest params?
							block: false
						});

						Object.defineProperty( node, '_scope', { value: scope });

						break;

					case 'BlockStatement':
						scope = new Scope({
							parent: scope,
							block: true
						});

						Object.defineProperty( node, '_scope', { value: scope });

						break;

					case 'VariableDeclaration':
						node.declarations.forEach( node.kind === 'let' ? addToBlockScope : addToScope ); // TODO const?
						break;

					case 'ClassExpression':
					case 'ClassDeclaration':
						addToScope( node );
						break;
				}
			},
			leave ( node ) {
				if ( node === currentTopLevelStatement ) {
					currentTopLevelStatement = null;
				}

				switch ( node.type ) {
					case 'FunctionExpression':
					case 'FunctionDeclaration':
					case 'ArrowFunctionExpression':
					case 'BlockStatement':
						scope = scope.parent;
						break;
				}
			}
		});
	});

	// then, we need to find which top-level dependencies this statement has,
	// and which it potentially modifies
	ast.body.forEach( statement => {
		function checkForReads ( node, parent ) {
			if ( node.type === 'Identifier' ) {
				const definingScope = scope.findDefiningScope( node.name );

				if ( ( !definingScope || definingScope.depth === 0 ) && !statement._defines[ node.name ] ) {
					statement._dependsOn[ node.name ] = true;
				}
			}

		}

		function checkForWrites ( node ) {

		}

		walk( statement, {
			enter ( node, parent ) {
				// skip imports
				if ( /^Import/.test( node.type ) ) return this.skip();

				if ( node._scope ) scope = node._scope;

				checkForReads( node, parent );
				checkForWrites( node, parent );

				//if ( node.type === 'ReturnStatement')

			},
			leave ( node ) {
				if ( node._scope ) scope = scope.parent;
			}
		});
	});

	ast._scope = scope;
}