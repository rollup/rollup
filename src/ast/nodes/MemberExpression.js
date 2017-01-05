import isReference from 'is-reference';
import relativeId from '../../utils/relativeId.js';
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
				const exporterId = declaration.module.id;

				const part = keypath.parts[0];
				declaration = declaration.module.traceExport( part.name );

				if ( !declaration ) {
					this.module.warn({
						code: 'MISSING_EXPORT',
						message: `'${part.name}' is not exported by '${relativeId( exporterId )}'`,
						url: `https://github.com/rollup/rollup/wiki/Troubleshooting#name-is-not-exported-by-module`
					}, part.start );
					this.replacement = 'undefined';
					return;
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

		else if ( this.replacement ) {
			code.overwrite( this.start, this.end, this.replacement, true );
		}

		super.render( code, es );
	}

	run ( scope ) {
		if ( this.declaration ) this.declaration.activate();
		super.run( scope );
	}
}
