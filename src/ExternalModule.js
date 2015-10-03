import { blank } from './utils/object';
import makeLegalIdentifier from './utils/makeLegalIdentifier';

class ExternalDeclaration {
	constructor ( module, name ) {
		this.module = module;
		this.name = name;
		this.isExternal = true;

		this.references = [];
	}
}

export default class ExternalModule {
	constructor ( id ) {
		this.id = id;
		this.name = makeLegalIdentifier( id );

		this.isExternal = true;
		this.declarations = blank();

		this.suggestedNames = blank();

		this.needsDefault = false;

		// Invariant: needsNamed and needsAll are never both true at once.
		// Because an import with both a namespace and named import is invalid:
		//
		// 		import * as ns, { a } from '...'
		//
		this.needsNamed = false;
		this.needsAll = false;
	}

	findDefiningStatement () {
		return null;
	}

	rename () {
		// noop
	}

	suggestName ( exportName, suggestion ) {
		if ( !this.suggestedNames[ exportName ] ) {
			this.suggestedNames[ exportName ] = suggestion;
		}
	}

	traceExport ( name ) {
		if ( name === 'default' ) {
			this.needsDefault = true;
		} else {
			this.needsNamed = true;
		}

		return this.declarations[ name ] || (
			this.declarations[ name ] = new ExternalDeclaration( this, name )
		);
	}
}
