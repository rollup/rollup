import { has, keys } from './utils/object';
import { getName } from './utils/map-helpers';
import getLocation from './utils/getLocation';
import walk from './ast/walk';
import Scope from './ast/Scope';

export default class Statement {
	constructor ( node, magicString, module ) {
		this.node = node;
		this.module = module;
		this.magicString = magicString;

		this.scope = new Scope();
		this.defines = {};
		this.modifies = {};
		this.dependsOn = {};

		this.isIncluded = false;

		this.leadingComments = []
		this.trailingComment = null;
		this.margin = [ 0, 0 ];

		// some facts about this statement...
		this.isImportDeclaration = node.type === 'ImportDeclaration';
		this.isExportDeclaration = /^Export/.test( node.type );
	}

	analyse () {
		if ( this.isImportDeclaration ) return; // nothing to analyse

		const statement = this; // TODO use arrow functions instead
		const magicString = this.magicString;

		let scope = this.scope;

		function addToScope ( declarator ) {
			var name = declarator.id.name;
			scope.add( name, false );

			if ( !scope.parent ) {
				statement.defines[ name ] = true;
			}
		}

		function addToBlockScope ( declarator ) {
			var name = declarator.id.name;
			scope.add( name, true );

			if ( !scope.parent ) {
				statement.defines[ name ] = true;
			}
		}

		walk( this.node, {
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
				if ( node._scope ) {
					scope = scope.parent;
				}
			}
		});

		if ( !this.isImportDeclaration ) {
			walk( this.node, {
				enter: ( node, parent ) => {
					if ( node._scope ) scope = node._scope;

					this.checkForReads( scope, node, parent );
					this.checkForWrites( scope, node );
				},
				leave: ( node ) => {
					if ( node._scope ) scope = scope.parent;
				}
			});
		}
	}

	checkForReads ( scope, node, parent ) {
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

			if ( ( !definingScope || definingScope.depth === 0 ) && !this.defines[ node.name ] ) {
				this.dependsOn[ node.name ] = true;
			}
		}
	}

	checkForWrites ( scope, node ) {
		const addNode = ( node, disallowImportReassignments ) => {
			while ( node.type === 'MemberExpression' ) {
				node = node.object;
			}

			// disallow assignments/updates to imported bindings and namespaces
			if ( disallowImportReassignments && has( this.module.imports, node.name ) && !scope.contains( node.name ) ) {
				const err = new Error( `Illegal reassignment to import '${node.name}'` );
				err.file = this.module.path;
				err.loc = getLocation( this.module.magicString.toString(), node.start );
				throw err;
			}

			if ( node.type !== 'Identifier' ) {
				return;
			}

			this.modifies[ node.name ] = true;
		};

		if ( node.type === 'AssignmentExpression' ) {
			addNode( node.left, true );
		}

		else if ( node.type === 'UpdateExpression' ) {
			addNode( node.argument, true );
		}

		else if ( node.type === 'CallExpression' ) {
			node.arguments.forEach( arg => addNode( arg, false ) );
		}
	}
}
