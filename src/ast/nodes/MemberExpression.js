import relativeId from '../../utils/relativeId.js';
import Node from '../Node.js';
import { unknown } from '../values.js';

const validProp = /^[a-zA-Z_$][a-zA-Z_$0-9]*$/;

class Keypath {
	constructor ( node ) {
		this.parts = [];

		while ( node.type === 'MemberExpression' ) {
			const prop = node.property;

			if ( node.computed  ) {
				if ( prop.type !== 'Literal' || typeof prop.value !== 'string' || !validProp.test( prop.value ) ) {
					this.computed = true;
					return;
				}
			}

			this.parts.unshift( prop );
			node = node.object;
		}

		this.root = node;
	}
}

export default class MemberExpression extends Node {
	bind ( scope ) {
		// if this resolves to a namespaced declaration, prepare
		// to replace it
		const keypath = new Keypath( this );

		if ( !keypath.computed && keypath.root.type === 'Identifier' ) {
			let declaration = scope.findDeclaration( keypath.root.name );

			while ( declaration.isNamespace && keypath.parts.length ) {
				const exporterId = declaration.module.id;

				const part = keypath.parts[0];
				declaration = declaration.module.traceExport( part.name || part.value );

				if ( !declaration ) {
					this.module.warn({
						code: 'MISSING_EXPORT',
						message: `'${part.name || part.value}' is not exported by '${relativeId( exporterId )}'`,
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

	call ( context, args ) {
		if ( this.declaration ) {
			return this.declaration.call( undefined, args );
		}

		const objectValue = this.object.run();
		const propValue = this.computed ? this.property.run() : this.property.name;

		if ( !objectValue.getProperty ) {
			console.log( objectValue );
			throw new Error( `${objectValue} does not have getProperty method` );
		}

		const value = objectValue.getProperty( propValue );

		return value.call( objectValue, args );
	}

	gatherPossibleValues ( values ) {
		values.add( unknown ); // TODO
	}

	mark () {
		if ( this.declaration ) {
			this.declaration.activate();
		}

		this.object.mark();
		super.mark();
	}

	markReturnStatements () {
		if ( this.declaration ) {
			this.declaration.markReturnStatements();
		} else {
			// TODO this seems wrong. nothing should ever 'run' twice
			this.run().markReturnStatements();
		}
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

	run () {
		if ( this.declaration ) {
			return this.declaration;
		}

		const objectValue = this.object.run();
		const propValue = this.computed ? this.property.run() : this.property.name;

		return objectValue.getProperty( propValue );
	}

	setValue ( value ) {
		const objectValue = this.object.run();
		const propValue = this.computed ? this.property.run() : this.property.name;

		if ( !objectValue.setProperty ) {
			console.log( objectValue );
			throw new Error( `${objectValue} does not have setProperty method` );
		}

		objectValue.setProperty( propValue, value );
	}
}
