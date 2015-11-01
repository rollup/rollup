import { walk } from 'estree-walker';
import modifierNodes from '../ast/modifierNodes.js';
import isFunctionDeclaration from '../ast/isFunctionDeclaration.js';
import isReference from '../ast/isReference.js';
import flatten from '../ast/flatten';

let pureFunctions = {};
[
	// TODO add others to this list
	'Object.keys'
].forEach( name => pureFunctions[ name ] = true );

export default function testForSideEffects ( node, scope, statement, strongDependencies, force ) {
	let hasSideEffect = false;

	walk( node, {
		enter ( node, parent ) {
			if ( !force && /Function/.test( node.type ) ) return this.skip();

			if ( node._scope ) scope = node._scope;

			if ( isReference( node, parent ) ) {
				const flattened = flatten( node );

				if ( !scope.contains( flattened.name ) ) {
					const declaration = statement.module.trace( flattened.name );
					if ( declaration && !declaration.isExternal ) {
						const module = declaration.module || declaration.statement.module; // TODO is this right?
						if ( !~strongDependencies.indexOf( module ) ) strongDependencies.push( module );
					}
				}
			}

			// If this is a top-level call expression, or an assignment to a global,
			// this statement will need to be marked
			else if ( node.type === 'NewExpression' ) {
				hasSideEffect = true;
			}

			else if ( node.type === 'CallExpression' ) {
				if ( node.callee.type === 'Identifier' ) {
					const declaration = scope.findDeclaration( node.callee.name ) ||
					                    statement.module.trace( node.callee.name );

					if ( declaration ) {
						if ( declaration.isExternal || declaration.testForSideEffects( strongDependencies ) ) {
							hasSideEffect = true;
						}
					} else if ( !pureFunctions[ node.callee.name ] ) {
						hasSideEffect = true;
					}

					if ( !declaration || declaration.isExternal ) {
						// we're calling a global or an external function. Assume side-effects
						hasSideEffect = true;
					}

					// we're calling a function defined in this bundle
					else if ( declaration.testForSideEffects( strongDependencies ) ) {
						hasSideEffect = true;
					}

					// TODO does function mutate inputs that are needed?
				}

				else if ( node.callee.type === 'MemberExpression' ) {
					const flattened = flatten( node.callee );

					if ( flattened ) {
						// if we're calling e.g. Object.keys(thing), there are no side-effects
						// TODO make pureFunctions configurable
						const declaration = statement.module.trace( flattened.name );
						if ( !!declaration || !pureFunctions[ flattened.keypath ] ) {
							hasSideEffect = true;
						}
					} else {
						// is not a keypath like `foo.bar.baz` – could be e.g.
						// `(a || b).foo()`. Err on the side of caution
						hasSideEffect = true;
					}
				}

				// otherwise we're probably dealing with a function expression
				else if ( testForSideEffects( node.callee, scope, statement, strongDependencies, true ) ) {
					hasSideEffect = true;
				}
			}

			else if ( node.type in modifierNodes ) {
				let subject = node[ modifierNodes[ node.type ] ];
				while ( subject.type === 'MemberExpression' ) subject = subject.object;

				if ( !scope.findDeclaration( subject.name ) ) {
					const declaration = statement.module.trace( subject.name );

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
