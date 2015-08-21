import { blank } from './utils/object';

export default class ExternalModule {
	constructor ( id ) {
		this.id = id;
		this.name = null;

		this.isExternal = true;
		this.importedByBundle = [];

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
}
