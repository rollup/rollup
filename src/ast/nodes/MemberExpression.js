import relativeId from '../../utils/relativeId.js';
import Node from '../Node.js';
import flatten from '../utils/flatten.js';
import pureFunctions from './shared/pureFunctions.js';
import { unknown } from '../values.js';

export default class MemberExpression extends Node {
	bind ( scope ) {
		// if this resolves to a namespaced declaration, prepare
		// to replace it
		if ( this.flattened && this.flattened.root.type === 'Identifier' ) {
			let declaration = scope.findDeclaration( this.flattened.root.name );

			while ( declaration.isNamespace && this.flattened.parts.length ) {
				const exporterId = declaration.module.id;

				const part = this.flattened.parts[0];
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

				this.flattened.parts.shift();
			}

			if ( this.flattened.parts.length ) {
				super.bind( scope );
				return; // not a namespaced declaration
			}

			// TODO this needs to be the result of calling declaration.run(),
			// not the declaration itself. gah
			this.declaration = declaration;

			if ( declaration.isExternal ) {
				declaration.module.suggestName( this.flattened.root.name );
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

		// TODO a better representation of these functions
		if ( this.flattened && this.flattened.keypath in pureFunctions ) {
			const declaration = this.scope.findDeclaration( this.flattened.name );
			if ( declaration.isGlobal ) {
				args.forEach( arg => arg.run() );
				return;
			}
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

	initialise ( scope ) {
		this.scope = scope;
		this.flattened = flatten( this );
		super.initialise( scope );
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

		if ( !objectValue ) {
			console.log( `${this.object} does not contain a value` );
		}

		if ( !objectValue.setProperty ) {
			console.log( `${this}` )
			console.log( objectValue );
			throw new Error( `${objectValue} does not have setProperty method` );
		}

		objectValue.setProperty( propValue, value );
	}
}
