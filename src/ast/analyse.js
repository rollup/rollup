import walk from './walk';
import Scope from './Scope';
import { getName } from '../utils/map-helpers';

export default function analyse ( ast, magicString, module ) {
	let scope = new Scope();
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

	// first we need to generate comprehensive scope info
	let previous = 0;

	ast.body.forEach( statement => {
		Object.defineProperties( statement, {
			_defines:   { value: {} },
			_modifies:  { value: {} },
			_dependsOn: { value: {} },
			_included:  { value: false, writable: true },
			_module:    { value: module },
			_source:    { value: magicString.snip( previous, statement.end ) } // TODO don't use snip, it's a waste of memory
		});

		previous = statement.end;
		currentTopLevelStatement = statement; // so we can attach scoping info

		walk( statement, {
			enter ( node ) {
				let newScope;

				magicString.addSourcemapLocation( node.start );

				switch ( node.type ) {
					case 'FunctionExpression':
					case 'FunctionDeclaration':
					case 'ArrowFunctionExpression':
						let names = node.params.map( getName );

						if ( node.type === 'FunctionDeclaration' ) {
							addToScope( node );
						} else if ( node.type === 'FunctionExpression' && node.id ) {
							names.push( node.id.name );
						}

						newScope = new Scope({
							parent: scope,
							params: names, // TODO rest params?
							block: false
						});

						break;

					case 'BlockStatement':
						newScope = new Scope({
							parent: scope,
							block: true
						});

						break;

					case 'CatchClause':
						newScope = new Scope({
							parent: scope,
							params: [ node.param.name ],
							block: true
						});

						break;

					case 'VariableDeclaration':
						node.declarations.forEach( node.kind === 'let' ? addToBlockScope : addToScope ); // TODO const?
						break;

					case 'ClassExpression':
					case 'ClassDeclaration':
						addToScope( node );
						break;
				}

				if ( newScope ) {
					Object.defineProperty( node, '_scope', { value: newScope });
					scope = newScope;
				}
			},
			leave ( node ) {
				if ( node === currentTopLevelStatement ) {
					currentTopLevelStatement = null;
				}

				if ( node._scope ) {
					scope = scope.parent;
				}
			}
		});
	});

	// then, we need to find which top-level dependencies this statement has,
	// and which it potentially modifies
	ast.body.forEach( statement => {
		function checkForReads ( node, parent ) {
			if ( node.type === 'Identifier' ) {
				// disregard the `bar` in `foo.bar` - these appear as Identifier nodes
				if ( parent.type === 'MemberExpression' && node !== parent.object ) {
					return;
				}

				// disregard the `bar` in { bar: foo }
				if ( parent.type === 'Property' && node !== parent.value ) {
					return;
				}

				const definingScope = scope.findDefiningScope( node.name );

				if ( ( !definingScope || definingScope.depth === 0 ) && !statement._defines[ node.name ] ) {
					statement._dependsOn[ node.name ] = true;
				}
			}

		}

		function checkForWrites ( node ) {
			function addNode ( node ) {
				while ( node.type === 'MemberExpression' ) {
					node = node.object;
				}

				if ( node.type !== 'Identifier' ) {
					return;
				}

				statement._modifies[ node.name ] = true;
			}

			if ( node.type === 'AssignmentExpression' ) {
				addNode( node.left );
			}

			else if ( node.type === 'CallExpression' ) {
				node.arguments.forEach( addNode );
			}

			// TODO UpdateExpressions, method calls?
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