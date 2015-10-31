import { walk } from 'estree-walker';
import modifierNodes from '../ast/modifierNodes.js';
import flatten from '../ast/flatten';

let pureFunctions = {};
[
	// TODO add others to this list
	'Object.keys'
].forEach( name => pureFunctions[ name ] = true );

export default function testForSideEffects ( node, scope, statement ) {
	let hasSideEffect = false;

	walk( node, {
		enter ( node ) {
			if ( hasSideEffect ) return this.skip();
			if ( /Function/.test( node.type ) ) return this.skip();

			if ( node._scope ) scope = node._scope;

			// If this is a top-level call expression, or an assignment to a global,
			// this statement will need to be marked
			if ( node.type === 'NewExpression' ) {
				hasSideEffect = true;
				return this.skip();
			}

			if ( node.type === 'CallExpression' ) {
				if ( node.callee.type === 'Identifier' && !scope.contains( node.callee.name ) ) {
					const declaration = statement.module.trace( node.callee.name );

					if ( !declaration || declaration.isExternal ) {
						// we're calling a global or an external function. Assume side-effects
						hasSideEffect = true;
						return this.skip();
					}

					// we're calling a function defined in this bundle
					if ( declaration.hasSideEffect() ) {
						hasSideEffect = true;
						return this.skip();
					}

					// TODO does function mutate inputs that are needed?
					return;
				}

				if ( node.callee.type === 'MemberExpression' ) {
					const flattened = flatten( node.callee );

					if ( !flattened ) {
						// is not a keypath like `foo.bar.baz` – could be e.g.
						// `(a || b).foo()`. Err on the side of caution
						hasSideEffect = true;
						return;
					}

					// if we're calling e.g. Object.keys(thing), there are no side-effects
					// TODO make pureFunctions configurable
					const declaration = statement.module.trace( flattened.name );
					if ( !declaration && pureFunctions[ flattened.keypath ] ) return;

					hasSideEffect = true;
					return this.skip();
				}

				// otherwise we're probably dealing with a function expression
				if ( testForSideEffects( node.callee, scope, statement ) ) {
					hasSideEffect = true;
					return this.skip();
				}
			}

			if ( node.type in modifierNodes ) {
				let subject = node[ modifierNodes[ node.type ] ];
				while ( subject.type === 'MemberExpression' ) subject = subject.object;

				const declaration = statement.module.trace( subject.name );

				if ( !declaration || declaration.isExternal || declaration.statement.isIncluded ) {
					hasSideEffect = true;
					return this.skip();
				}
			}
		},
		leave ( node ) {
			if ( node._scope ) scope = scope.parent;
		}
	});

	return hasSideEffect;
}
