import isReference from '../utils/isReference.js';
import Node from '../Node.js';
import { UNKNOWN } from '../values.js';

class Keypath {
	constructor ( node ) {
		this.parts = [];

		while ( node.type === 'MemberExpression' ) {
			this.parts.unshift( node.property );
			node = node.object;
		}

		this.root = node;
	}
}

export default class MemberExpression extends Node {
	bind ( scope ) {
		// if this resolves to a namespaced declaration, prepare
		// to replace it
		// TODO this code is a bit inefficient
		if ( isReference( this ) ) { // TODO optimise namespace access like `foo['bar']` as well
			const keypath = new Keypath( this );

			let declaration = scope.findDeclaration( keypath.root.name );

			while ( declaration.isNamespace && keypath.parts.length ) {
				const part = keypath.parts[0];
				declaration = declaration.module.traceExport( part.name );

				if ( !declaration ) {
					this.module.bundle.onwarn( `Export '${part.name}' is not defined by '${this.module.id}'` );
					break;
				}

				keypath.parts.shift();
			}

			if ( keypath.parts.length ) {
				super.bind( scope );
				return; // not a namespaced declaration
			}

			this.declaration = declaration;

			if ( declaration.isExternal ) {
				declaration.module.suggestName( keypath.root.name );
			}
		}

		else {
			super.bind( scope );
		}
	}

	gatherPossibleValues ( values ) {
		values.add( UNKNOWN ); // TODO
	}

	render ( code, es ) {
		if ( this.declaration ) {
			const name = this.declaration.getName( es );
			if ( name !== this.name ) code.overwrite( this.start, this.end, name, true );
		}

		super.render( code, es );
	}

	run ( scope ) {
		if ( this.declaration ) this.declaration.activate();
		super.run( scope );
	}
}
