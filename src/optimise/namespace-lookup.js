import walk from '../ast/walk.js';
import getLocation from '../utils/getLocation.js';

// Extract the property access from a MemberExpression.
function property ( node ) {
	return node.name ? `.${node.name}` : `[${node.value}]`;
}

// Recursively traverse the chain of member expressions from `node`,
// returning the access, e.g. `foo.bar[17]`
function chainedMemberExpression ( node ) {
	if ( node.object.type === 'MemberExpression' ) {
		return chainedMemberExpression( node.object ) + property( node.property );
	}

	return node.object.name + property( node.property );
}

export default function ( statement ) {
	let localName;				// The local name of the top-most imported namespace.
	let topNode = null;	 // The top-node of the member expression.
	let namespace = null; // An instance of `Module`.

	walk( statement.node, {
		leave ( node, parent ) {
			// Optimize namespace lookups, which manifest as MemberExpressions.
			if ( node.type === 'MemberExpression' && ( !topNode || node.object === topNode ) ) {
				// Ignore anything that doesn't begin with an identifier.
				if ( !topNode && node.object.type !== 'Identifier') return;

				topNode = node;

				// If we don't already have a namespace,
				// we aren't currently exploring any chain of member expressions.
				if ( !namespace ) {
					localName = node.object.name;

					// At first, we don't have a namespace, so we'll try to look one up.
					const id = statement.module.locals.lookup( localName );

					// It only counts if it exists, is a module, and isn't external.
					if ( !id || !id.isModule || id.isExternal ) return;

					namespace = id;
				}

				// If a namespace is the left hand side of an assignment, throw an error.
				if ( parent.type === 'AssignmentExpression' && parent.left === node ||
						parent.type === 'UpdateExpression' && parent.argument === node ) {
					const err = new Error( `Illegal reassignment to import '${chainedMemberExpression( node )}'` );
					err.file = statement.module.id;
					err.loc = getLocation( statement.module.magicString.toString(), node.start );
					throw err;
				}

				// Extract the name of the accessed property, from and Identifier or Literal.
				// Any eventual Literal value is converted to a string.
				const name = !node.computed ? node.property.name :
					( node.property.type === 'Literal' ? String( node.property.value ) : null );

				// If we can't resolve the name being accessed statically,
				// we mark the whole namespace for inclusion in the bundle.
				//
				//		 // resolvable
				//		 console.log( javascript.keywords.for )
				//		 console.log( javascript.keywords[ 'for' ] )
				//		 console.log( javascript.keywords[ 6 ] )
				//
				//		 // unresolvable
				//		 console.log( javascript.keywords[ index ] )
				//		 console.log( javascript.keywords[ 1 + 5 ] )
				if ( name === null ) {
					namespace.mark();

					namespace = null;
					topNode = null;
					return;
				}

				const id = namespace.exports.lookup( name );

				// If the namespace doesn't export the given name,
				// we can throw an error (even for nested namespaces).
				if ( !id ) {
					throw new Error( `Module "${namespace.id}" doesn't export "${name}"!` );
				}

				// We can't resolve deeper. Replace the member chain.
				if ( parent.type !== 'MemberExpression' || !( id.isModule && !id.isExternal ) ) {
					if ( !~statement.dependantIds.indexOf( id ) ) {
						statement.dependantIds.push( id );
					}

					// FIXME: do this better
					// If an earlier stage detected that we depend on this name...
					if ( statement.dependsOn[ localName ] ) {
						// ... decrement the count...
						if ( !--statement.dependsOn[ localName ] ) {
							// ... and remove it if the count is 0.
							delete statement.dependsOn[ localName ];
						}
					}

					statement.namespaceReplacements.push( [ topNode, id ] );
					namespace = null;
					topNode = null;
					return;
				}

				namespace = id;
			}
		}
	});
}
