import { walk } from 'estree-walker';
import modifierNodes from '../ast/modifierNodes.js';
import isReference from '../ast/isReference.js';
import flatten from '../ast/flatten';

let pureFunctions = {};
[
	// TODO add others to this list from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
	'Array', 'Array.isArray',
	'Error', 'EvalError', 'InternalError', 'RangeError', 'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
	'Object', 'Object.keys'
].forEach( name => pureFunctions[ name ] = true );

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
				} if ( !scope.contains( flattened.name ) ) {
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
				if ( node.callee.type === 'Identifier' ) {
					const declaration = scope.findDeclaration( node.callee.name ) ||
					                    statement.module.trace( node.callee.name );

					if ( declaration ) {
						if ( declaration.isExternal || declaration.run( strongDependencies ) ) {
							hasSideEffect = true;
						}
					} else if ( !pureFunctions[ node.callee.name ] ) {
						hasSideEffect = true;
					}
				}

				else if ( node.callee.type === 'MemberExpression' ) {
					const flattened = flatten( node.callee );

					if ( flattened ) {
						// if we're calling e.g. Object.keys(thing), there are no side-effects
						// TODO make pureFunctions configurable
						const declaration = scope.findDeclaration( flattened.name ) || statement.module.trace( flattened.name );

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
				else if ( run( node.callee, scope, statement, strongDependencies, true ) ) {
					hasSideEffect = true;
				}
			}

			else if ( node.type in modifierNodes ) {
				let subject = node[ modifierNodes[ node.type ] ];
				while ( subject.type === 'MemberExpression' ) subject = subject.object;

				let declaration = scope.findDeclaration( subject.name );

				if ( declaration ) {
					if ( declaration.isParam ) hasSideEffect = true;
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
