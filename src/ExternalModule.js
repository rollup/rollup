import { blank } from './utils/object';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

class ExternalDeclaration {
	constructor ( module, name ) {
		this.module = module;
		this.importedAs = name;

		this.name = null;
		this.isExternal = true;

		this.references = [];
	}

	addReference ( reference ) {
		reference.declaration = this;
		this.name = reference.name;
	}

	getName () {
		if ( this.importedAs === '*' ) {
			return this.module.name;
		}

		if ( this.importedAs === 'default' ) {
			return this.module.needsNamed ?
				`${this.module.name}__default` :
				this.module.name;
		}

		return `${this.module.name}.${this.name}`;
	}
}

export default class ExternalModule {
	constructor ( id ) {
		this.id = id;
		this.name = makeLegalIdentifier( id );

		this.isExternal = true;
		this.declarations = blank();

		this.needsDefault = false;

		// Invariant: needsNamed and needsAll are never both true at once.
		// Because an import with both a namespace and named import is invalid:
		//
		// 		import * as ns, { a } from '...'
		//
		this.needsNamed = false;
		this.needsAll = false;
	}

	traceExport ( name ) {
		// TODO is this necessary? where is it used?
		if ( name === 'default' ) {
			this.needsDefault = true;
		} else if ( name === '*' ) {
			this.needsAll = true;
		} else {
			this.needsNamed = true;
		}

		return this.declarations[ name ] || (
			this.declarations[ name ] = new ExternalDeclaration( this, name )
		);
	}
}
