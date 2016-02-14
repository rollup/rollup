import { walk } from 'estree-walker';
import modifierNodes, { isModifierNode } from '../ast/modifierNodes.js';
import isReference from '../ast/isReference.js';
import flatten from '../ast/flatten';
import pureFunctions from './pureFunctions.js';
import getLocation from './getLocation.js';
import error from './error.js';

function call ( callee, scope, statement, strongDependencies ) {
	while ( callee.type === 'ParenthesizedExpression' ) callee = callee.expression;

	if ( callee.type === 'Identifier' ) {
		const declaration = scope.findDeclaration( callee.name ) ||
							statement.module.trace( callee.name );

		if ( declaration ) {
			if ( declaration.isNamespace ) {
				error({
					message: `Cannot call a namespace ('${callee.name}')`,
					file: statement.module.id,
					pos: callee.start,
					loc: getLocation( statement.module.code, callee.start )
				});
			}

			return declaration.run( strongDependencies );
		}

		return !pureFunctions[ callee.name ];
	}

	if ( /FunctionExpression/.test( callee.type ) ) {
		return run( callee.body, scope, statement, strongDependencies );
	}

	if ( callee.type === 'MemberExpression' ) {
		const flattened = flatten( callee );

		if ( flattened ) {
			// if we're calling e.g. Object.keys(thing), there are no side-effects
			// TODO make pureFunctions configurable
			const declaration = scope.findDeclaration( flattened.name ) || statement.module.trace( flattened.name );

			return ( !!declaration || !pureFunctions[ flattened.keypath ] );
		}
	}

	// complex case like `( a ? b : c )()` or foo[bar].baz()`
	// – err on the side of caution
	return true;
}

export default function run ( node, scope, statement, strongDependencies, force ) {
	let hasSideEffect = false;

	walk( node, {
		enter ( node, parent ) {
			if ( !force && /Function/.test( node.type ) ) return this.skip();

			if ( node._scope ) scope = node._scope;

			if ( isReference( node, parent ) ) {
				const flattened = flatten( node );

				if ( flattened.name === 'arguments' ) {
					hasSideEffect = true;
				}

				else if ( !scope.contains( flattened.name ) ) {
					const declaration = statement.module.trace( flattened.name );
					if ( declaration && !declaration.isExternal ) {
						const module = declaration.module || declaration.statement.module; // TODO is this right?
						if ( !module.isExternal && !~strongDependencies.indexOf( module ) ) strongDependencies.push( module );
					}
				}
			}

			else if ( node.type === 'ThrowStatement' ) {
				// we only care about errors thrown at the top level, otherwise
				// any function with error checking gets included if called
				if ( scope.isTopLevel ) hasSideEffect = true;
			}

			else if ( node.type === 'CallExpression' || node.type === 'NewExpression' ) {
				if ( call( node.callee, scope, statement, strongDependencies ) ) {
					hasSideEffect = true;
				}
			}

			else if ( isModifierNode( node ) ) {
				let subject = node[ modifierNodes[ node.type ] ];
				while ( subject.type === 'MemberExpression' ) subject = subject.object;

				let declaration = scope.findDeclaration( subject.name );

				if ( declaration ) {
					if ( declaration.isParam ) hasSideEffect = true;
				} else if ( !scope.isTopLevel ) {
					hasSideEffect = true;
				} else {
					declaration = statement.module.trace( subject.name );

					if ( !declaration || declaration.isExternal || declaration.isUsed ) {
						hasSideEffect = true;
					}
				}
			}
		},
		leave ( node ) {
			if ( node._scope ) scope = scope.parent;
		}
	});

	return hasSideEffect;
}
