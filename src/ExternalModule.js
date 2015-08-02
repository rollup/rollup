import { blank } from './utils/object';

export default class ExternalModule {
	constructor ( id, scope ) {
		this.id = id;

		this.scope = scope;

		this.isExternal = true;
		this.importedByBundle = [];

		this.canonicalNames = blank();
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

	get name () {
		return this.scope.name;
	}

	findDefiningStatement () {
		return null;
	}

	getCanonicalName ( name, direct ) {
		return this.scope.get( name, !this.needsNamed && direct );
	}

	rename ( name, replacement ) {
		this.scope.rename( name, replacement );
	}

	suggestName ( exportName, suggestion ) {
		this.scope.suggest( exportName, suggestion );
	}
}
